import {
  AudioGraphFilterNode,
  AudioGraphFilters,
  AudioGraphNodes,
  AudioGraphSourceNode,
  FftPeakType,
  PitchDetection,
} from '../../interfaces';
import { AudioMath } from '../audio-math/audio-math';
import { PitchShifterNode } from '../pitch-shifter-node/pitch-shifter-node';
import { WorkletNode } from '../worklet-node/worklet-node';

export class AudioGraph {
  public context: AudioContext = null;

  public nodes: AudioGraphNodes = null;

  public stream: MediaStream = null;

  public workletReady: Promise<void> = null;

  public filter: AudioGraphFilterNode = AudioGraphFilterNode.NONE;

  public paused = true;

  public suspended = true;

  public deviceLoading = false;

  public deviceStream: MediaStream = null;

  public fdata: Uint8Array[] = [];

  public tdata: Uint8Array = new Uint8Array(1);

  public autocorrdata: Float32Array = new Float32Array(1);

  public prominenceData: Uint8Array[] = [
    new Uint8Array(1),
    new Uint8Array(1),
  ];

  public canAnalyse = true;

  public minPitch = 20;

  public maxPitch = 20000;

  public recalculatePitch = true;

  public threshold = 0.2;

  public prominenceRadius = 0;

  public prominenceThreshold = 0.1;

  public fftPeakType: FftPeakType = FftPeakType.MAX_MAGNITUDE;

  public debug = false;

  public readonly minDecibels = -100;

  public readonly maxDecibels = 0;

  public readonly maxDelay = 5;

  public readonly fftSizes: number[] = [
    32,
    64,
    128,
    256,
    512,
    1024,
    2048,
    4096,
    8192,
    16384,
    32768,
  ];

  public readonly pitch: PitchDetection[] = [
    {
      name: 'Zero-crossing rate',
      short: 'ZCR',
      color: '#6f998a',
      calc: this.zcr.bind(this),
      timeDomain: true,
      enabled: true,
      values: [0, 0],
    },
    {
      name: 'FFT max',
      short: 'FFTM',
      color: '#96996f',
      calc: this.fftmax.bind(this),
      timeDomain: false,
      enabled: false,
      values: [0, 0],
    },
    {
      name: 'FFT peak',
      short: 'FFTP',
      color: '#7e6f99',
      calc: this.fftpeak.bind(this),
      timeDomain: false,
      enabled: false,
      values: [0, 0],
    },
    {
      name: 'Autocorrelation',
      short: 'AC',
      color: '#996f83',
      calc: this.autocorr.bind(this),
      timeDomain: true,
      enabled: false,
      values: [0, 0],
    },
  ];

  private _fftSize = 2048;

  /**
   * FFT size getter.
   */
  public get fftSize(): number {
    return this._fftSize;
  }

  /**
   * FFT size setter.
   */
  public set fftSize(size: number) {
    if (this.nodes?.analysers) {
      for (const node of this.nodes.analysers) {
        node.fftSize = size;
      }
    }
    this._fftSize = size;
  }

  private _smoothing: number[] = [0.5, 0.99];

  /**
   * Smoothing getter.
   */
  public get smoothing(): number[] {
    return this._smoothing;
  }

  /**
   * Smoothing setter.
   */
  public set smoothing(value: number[]) {
    if (this.nodes?.analysers) {
      this.nodes.analysers.forEach((node, i) => {
        node.smoothingTimeConstant = value[i];
      });
    }
    this._smoothing = value;
  }

  /**
   * TODO: description
   */
  public get sampleRate(): number {
    return this.context.sampleRate;
  }

  /**
   * Constructor.
   */
  constructor() {
    if (!window.AudioContext) {
      throw new Error('Web Audio API is not supported');
    }
    this.context = new AudioContext();
    void this.context.suspend();

    this.nodes = {
      wave: this.context.createOscillator(),
      worklet: null,
      device: null,
      element: null,
      input: this.context.createDelay(this.maxDelay),
      filter: {
        iir: this.context.createIIRFilter([1, 0, 0], [1, 0, 0]),
        biquad: this.context.createBiquadFilter(),
        convolver: this.context.createConvolver(),
        pitchShifter: new PitchShifterNode(this.context),
      },
      filteredInput: this.context.createGain(),
      analysers: null,
      output: this.context.createMediaStreamDestination(),
    };
    this.nodes.wave.start();
    this.nodes.input.connect(this.nodes.filteredInput);
    this.createAnalysers();
    this.stream = this.nodes.output.stream;

    this.workletReady = WorkletNode.register(this.context).then(() => {
      this.nodes.worklet = WorkletNode.create(this.context);
      window['params'] = this.nodes.worklet.parameters;
    });
    this.workletReady.catch(err => console.warn(err));
  }

  /**
   * TODO: description
   */
  public destroy() {
    if (this.context) {
      void this.context.close();
      this.context = null;
      this.nodes = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  /**
   * TODO: description
   */
  public play(): AudioGraph {
    if (this.suspended) {
      void this.context.resume();
      this.suspended = false;
    }
    if (this.paused) {
      // TODO
    }
    this.paused = false;
    return this;
  }

  /**
   * TODO: description
   */
  public pause(): AudioGraph {
    if (!this.paused) {
      // TODO
    }
    this.paused = true;
    return this;
  }

  /**
   * TODO: description
   * @param node
   * @param data
   */
  public enable(node: AudioGraphSourceNode, data?: any): Promise<void> {
    try {
      console.log('enable', node /*, data*/);
      switch (node) {
        case AudioGraphSourceNode.DEVICE:
          //this.setDevice(null);
          break;
        case AudioGraphSourceNode.FILE:
          this.setElement(data);
          break;
        case AudioGraphSourceNode.WAVE:
          this.nodes.wave.connect(this.nodes.input);
          break;
        case AudioGraphSourceNode.WORKLET:
          return this.workletReady.then(() => {
            console.log(this.nodes.worklet);
            this.nodes.worklet.connect(this.nodes.input);
          });
        default:
          throw new Error('invalid node ' + String(node));
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * TODO: description
   * @param node
   */
  public disable(node: AudioGraphSourceNode): AudioGraph {
    console.log('disable', node);
    switch (node) {
      case AudioGraphSourceNode.DEVICE:
        void this.setDevice(null);
        break;
      case AudioGraphSourceNode.FILE:
        this.setElement(null);
        break;
      case AudioGraphSourceNode.WAVE:
        this.nodes.wave.disconnect();
        break;
      case AudioGraphSourceNode.WORKLET:
        if (this.nodes.worklet) {
          this.nodes.worklet.disconnect();
        }
        break;
      default:
        throw new Error('invalid node ' + String(node));
    }
    return this;
  }

  /**
   * TODO: description
   * @param filter
   */
  public setFilter(filter: AudioGraphFilterNode): AudioGraph {
    console.log('set filter', filter);
    let node: AudioNode = null;
    switch (filter) {
      case AudioGraphFilterNode.NONE:
        break;
      case AudioGraphFilterNode.IIR:
        node = this.nodes.filter.iir;
        break;
      case AudioGraphFilterNode.BIQUAD:
        node = this.nodes.filter.biquad;
        break;
      case AudioGraphFilterNode.CONVOLVER:
        node = this.nodes.filter.convolver;
        break;
      case AudioGraphFilterNode.PITCH_SHIFTER:
        node = this.nodes.filter.pitchShifter;
        break;
      default:
        throw new Error('invalid filter ' + String(node));
    }

    this.nodes.input.disconnect();
    for (const k in this.nodes.filter) {
      if (Object.prototype.hasOwnProperty.call(this.nodes.filter, k)) {
        this.nodes.filter[k as keyof AudioGraphFilters].disconnect();
      }
    }

    if (node === null) {
      this.nodes.input.connect(this.nodes.filteredInput);
    } else {
      this.nodes.input.connect(node);
      node.connect(this.nodes.filteredInput);
    }
    this.filter = filter;

    return this;
  }

  /**
   * TODO: description
   */
  public setIir(feedforward: number[], feedback: number[]): AudioGraph {
    const node = this.context.createIIRFilter(feedforward, feedback);
    if (this.filter === AudioGraphFilterNode.IIR) {
      this.nodes.input.disconnect();
      this.nodes.filter.iir.disconnect();
      this.nodes.input.connect(node);
      node.connect(this.nodes.filteredInput);
    }
    this.nodes.filter.iir = node;
    return this;
  }

  /**
   * TODO: description
   */
  public setConvolver(
    duration: number,
    decay: number,
    frequency: number,
    overtones: number,
    overtoneDecay: number
  ) {
    const data = AudioMath.impulseResponse(
      this.sampleRate,
      duration,
      decay,
      frequency,
      overtones,
      overtoneDecay
    );
    const buffer = this.context.createBuffer(
      2,
      this.context.sampleRate * duration,
      this.context.sampleRate
    );
    for (let i = 0; i < buffer.numberOfChannels; ++i) {
      buffer.copyToChannel(data, i);
    }
    this.nodes.filter.convolver.buffer = buffer;
  }

  /**
   * TODO: description
   */
  public createAnalysers(): AudioGraph {
    if (this.nodes.analysers) {
      for (const node of this.nodes.analysers) {
        node.disconnect();
      }
      this.nodes.filteredInput.disconnect();
    }

    this.nodes.analysers = [
      this.context.createAnalyser(),
      this.context.createAnalyser(),
    ];
    this.nodes.analysers.forEach((node, i) => {
      node.fftSize = this.fftSize;
      node.maxDecibels = this.maxDecibels;
      node.minDecibels = this.minDecibels;
      node.smoothingTimeConstant = this.smoothing[i];
      this.nodes.filteredInput.connect(node);
    });

    while (this.fdata.length < this.nodes.analysers.length) {
      this.fdata.push(new Uint8Array(this.fftSize / 2));
    }

    this.nodes.analysers[0].connect(this.nodes.output);

    return this;
  }

  /**
   * TODO: description
   */
  public clearData(): AudioGraph {
    this.tdata.fill(0);
    for (const d of this.fdata) {
      d.fill(0);
    }
    for (const p of this.pitch) {
      for (let i = 0; i < p.values.length; ++i) {
        p.values[i] = 0;
      }
    }
    return this;
  }

  /**
   * TODO: description
   * @param d
   */
  public byteToDecibels(d: number): number {
    return (
      (d / 255.0) * (this.maxDecibels - this.minDecibels) + this.minDecibels
    );
  }

  /**
   * TODO: description
   */
  public getDevices(): Promise<MediaDeviceInfo[]> {
    if (!navigator?.mediaDevices?.enumerateDevices) {
      return Promise.reject(new Error('enumerateDevices is not supported'));
    }
    return navigator.mediaDevices
      .enumerateDevices()
      .then(ds => ds.filter(d => d.kind === 'audioinput'));
  }

  /**
   * TODO: description
   * @param dev
   */
  public setDevice(dev: MediaDeviceInfo | string): Promise<void> {
    let deviceId: string;
    if (this.deviceStream) {
      this.deviceStream.getTracks().forEach(track => track.stop());
      this.deviceStream = null;
    }
    if (this.nodes.device) {
      this.nodes.device.disconnect();
      this.nodes.device = null;
    }
    if (dev === null) {
      return Promise.resolve();
    } else if (typeof dev === 'string') {
      deviceId = dev;
    } else {
      deviceId = dev.deviceId;
    }
    if (!navigator?.mediaDevices?.getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not supported'));
    }
    if (this.deviceLoading) {
      return Promise.reject(new Error('already setting device'));
    }
    const res = navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: { deviceId },
      })
      .then(stream => {
        this.deviceStream = stream;
        this.nodes.device = this.context.createMediaStreamSource(
          this.deviceStream
        );
        this.nodes.device.connect(this.nodes.input);
      })
      .finally(() => {
        this.deviceLoading = false;
      });
    this.deviceLoading = true;
    return res;
  }

  /**
   * TODO: description
   * @param el
   */
  public setElement(el: HTMLAudioElement): AudioGraph {
    if (this.nodes.element) {
      this.nodes.element.disconnect();
      this.nodes.element = null;
    }
    if (el) {
      this.nodes.element = this.context.createMediaElementSource(el);
      this.nodes.element.connect(this.nodes.input);
    }
    return this;
  }

  /**
   * TODO: description
   */
  public update(): AudioGraph {
    if (this.paused) {
      return this;
    }

    for (let i = 0; i < this.nodes.analysers.length; i += 1) {
      const node = this.nodes.analysers[i];
      if (i === 0) {
        this.tdata = AudioMath.resize(this.tdata, node.fftSize);
        node.getByteTimeDomainData(this.tdata);
      }
      this.fdata[i] = AudioMath.resize(this.fdata[i], node.frequencyBinCount);
      node.getByteFrequencyData(this.fdata[i]);
    }

    const fmax = Math.max.apply(null, this.fdata[0]) / 255;
    this.canAnalyse = fmax > this.threshold;

    return this;
  }

  /**
   * TODO: description
   */
  public analyse(): AudioGraph {
    this.update();

    if (!this.canAnalyse) {
      return this;
    }

    for (const pd of this.pitch) {
      if (!pd.enabled) {
        pd.values.fill(0);
        continue;
      }
      if (this.paused && pd.values.every(v => v > 1)) {
        continue;
      }
      if (this.recalculatePitch && !pd.timeDomain) {
        for (let i = 0; i < this.smoothing.length; ++i) {
          pd.values[i] = pd.calc(i);
        }
      } else {
        const value: number = pd.calc(0);
        pd.values.forEach((prev, i) => {
          if (prev > 1) {
            pd.values[i] = AudioMath.smooth(this.smoothing[i], prev, value);
          } else {
            pd.values[i] = value;
          }
        });
      }
    }

    return this;
  }

  /**
   * TODO: description
   * @param i
   */
  public zcr(i: number): number {
    let res: number = AudioMath.zcr(this.tdata);
    res *= this.sampleRate;
    res = AudioMath.clampPitch(res, this.minPitch, this.maxPitch);
    return res;
  }

  /**
   * TODO: description
   * @param i
   */
  public fftmax(i: number): number {
    const fdata = this.fdata[i];
    const fscale: number = this.fftSize / this.sampleRate;
    const start: number = Math.floor(this.minPitch * fscale);
    const end: number = Math.floor(this.maxPitch * fscale) + 1;
    let res: number = AudioMath.indexOfMax(fdata, start, end);
    if (res > 0 && res < fdata.length - 1) {
      res += AudioMath.interpolatePeak(
        fdata[res],
        fdata[res - 1],
        fdata[res + 1]
      );
    }
    res /= fscale;
    return res;
  }

  /**
   * TODO: description
   * @param i
   */
  public fftpeak(i: number): number {
    const fdata = this.fdata[i];
    const fscale: number = this.fftSize / this.sampleRate;
    const start: number = Math.floor(this.minPitch * fscale);
    const end: number = Math.floor(this.maxPitch * fscale) + 1;

    const prominence = AudioMath.prominence(
      this.fdata[i],
      this.prominenceData[i],
      this.fftPeakType,
      start,
      end,
      this.prominenceRadius,
      this.prominenceThreshold * 255
    );

    this.prominenceData[i] = prominence.value;
    let res: number = prominence.peak;

    if (res > 0 && res < fdata.length - 1) {
      res += AudioMath.interpolatePeak(
        fdata[res],
        fdata[res - 1],
        fdata[res + 1]
      );
    }
    res /= fscale;

    return res;
  }

  /**
   * TODO: description
   * @param i
   */
  public autocorr(i: number): number {
    const start = Math.floor(this.sampleRate / this.maxPitch);
    const end = Math.floor(this.sampleRate / this.minPitch) + 1;
    const ac = AudioMath.autocorrelation(
      this.tdata,
      start,
      end,
      this.autocorrdata
    );
    this.autocorrdata = ac.value;
    return this.sampleRate / ac.peak;
  }
}
