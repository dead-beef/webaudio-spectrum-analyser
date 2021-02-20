import {
  AnyScriptNode,
  AudioGraphFilterNode,
  AudioGraphFilters,
  AudioGraphNodes,
  AudioGraphSourceNode,
  AudioGraphUpdateHandler,
  FftPeakType,
  PitchDetection,
} from '../../interfaces';
import {
  AudioGraphStateModel,
  BiquadState,
  ConvolverState,
  IirState,
  PitchShifterState,
  WorkletFilterState,
} from '../../state/audio-graph/audio-graph.model';
import { AudioMath } from '../audio-math/audio-math';
import { PitchShifterNode } from '../pitch-shifter-node/pitch-shifter-node';
import { WorkletNodeFactory } from '../worklet-node-factory/worklet-node-factory';
import { FilterProcessor, GeneratorProcessor } from '../worklet-processor';

export class AudioGraph {
  public context: AudioContext;

  public nodes: AudioGraphNodes;

  public stream: MediaStream;

  public workletFactory: WorkletNodeFactory;

  public workletReady: Promise<void>;

  public workletFilterReady: Promise<void>;

  public filter: AudioGraphFilterNode = AudioGraphFilterNode.NONE;

  private _frame = 0;

  private readonly _updateLoopBound = this._updateLoop.bind(this);

  private readonly _onUpdate: AudioGraphUpdateHandler[] = [];

  public updating = false;

  public paused = true;

  public suspended = true;

  public deviceLoading = false;

  public deviceStream: Nullable<MediaStream> = null;

  public fdata: Float32Array = new Float32Array(1);

  public tdata: Float32Array = new Float32Array(1);

  public autocorrdata: Float32Array = new Float32Array(1);

  public prominenceData: Float32Array = new Float32Array(1);

  public canAnalyse = true;

  public volume = 0.5;

  public minPitch = 20;

  public maxPitch = 20000;

  public threshold = 0.2;

  public prominenceRadius = 0;

  public prominenceThreshold = 0.1;

  public prominenceNormalize = false;

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
      id: 'ZCR',
      name: 'Zero-crossing rate',
      calc: this.zcr.bind(this),
      timeDomain: true,
      enabled: true,
      value: 0,
    },
    {
      id: 'FFTM',
      name: 'FFT max',
      calc: this.fftmax.bind(this),
      timeDomain: false,
      enabled: false,
      value: 0,
    },
    {
      id: 'FFTP',
      name: 'FFT peak',
      calc: this.fftpeak.bind(this),
      timeDomain: false,
      enabled: false,
      value: 0,
    },
    {
      id: 'AC',
      name: 'Autocorrelation',
      calc: this.autocorr.bind(this),
      timeDomain: true,
      enabled: false,
      value: 0,
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
    this.nodes.analyser.fftSize = size;
    this._fftSize = size;
  }

  private _smoothing = 0.5;

  /**
   * Smoothing getter.
   */
  public get smoothing(): number {
    return this._smoothing;
  }

  /**
   * Smoothing setter.
   */
  public set smoothing(value: number) {
    this.nodes.analyser.smoothingTimeConstant = value;
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
        worklet: null,
      },
      filteredInput: this.context.createGain(),
      analyser: this.createAnalyserNode(),
      output: this.context.createMediaStreamDestination(),
    };
    this.nodes.wave.start();
    this.nodes.input.connect(this.nodes.filteredInput);
    this.nodes.filteredInput.connect(this.nodes.analyser);
    this.nodes.analyser.connect(this.nodes.output);
    this.stream = this.nodes.output.stream;

    this.workletFactory = new WorkletNodeFactory(this.context);

    this.workletReady = this.workletFactory
      .create(GeneratorProcessor)
      .then(node => {
        this.nodes.worklet = node;
        //window['params'] = node.parameters;
      });
    this.workletReady.catch(err => console.warn(err));

    this.workletFilterReady = this.workletFactory
      .create(FilterProcessor)
      .then(node => {
        this.nodes.filter.worklet = node;
        //window['params'] = node.parameters;
        return AudioMath.wasmReady;
      })
      .then(wasm => {
        this.nodes.filter.worklet!.port.postMessage({
          type: 'init',
          module: wasm.raw.module,
          memorySize: wasm.emModule.buffer.byteLength,
          sampleRate: this.sampleRate,
        });
      });
    this.workletFilterReady.catch(err => console.warn(err));
  }

  /**
   * TODO: description
   * @param state
   */
  public setState(state: AudioGraphStateModel) {
    this.volume = state.volume;
    this.nodes.input.delayTime.value = state.delay;
    this.fftSize = state.fftSize;
    this.smoothing = state.smoothing;
    this.debug = state.debug;

    this.minPitch = state.pitch.min;
    this.maxPitch = state.pitch.max;
    for (const pd of this.pitch) {
      pd.enabled = state.pitch[pd.id];
    }

    this.nodes.wave.type = state.wave.shape;
    this.nodes.wave.frequency.value = state.wave.frequency;

    this.setFilter(state.filter.id);

    this.setIir(state.filter.iir);
    this.setBiquad(state.filter.biquad);
    this.setPitchShifter(state.filter.pitchShifter);
    this.setConvolver(state.filter.convolver);

    this.fftPeakType = state.fftp.type;

    this.prominenceRadius = state.fftp.prominence.radius;
    this.prominenceThreshold = state.fftp.prominence.threshold;
    this.prominenceNormalize = state.fftp.prominence.normalize;

    void this.setWorkletSourceParameters(state.worklet);
    void this.setWorkletFilterParameters(state.filter.worklet);
  }

  /**
   * TODO: description
   */
  public destroy() {
    if (this.updating) {
      this.stopUpdating();
    }
    if (this.context) {
      void this.context.close();
      //this.context = null;
      //this.nodes = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      //this.stream = null;
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
   */
  public startUpdating(): AudioGraph {
    if (!this.updating) {
      this.updating = true;
      this._frame = requestAnimationFrame(this._updateLoopBound);
    }
    return this;
  }

  /**
   * TODO: description
   */
  public stopUpdating(): AudioGraph {
    if (this.updating) {
      this.updating = false;
      cancelAnimationFrame(this._frame);
      this._frame = 0;
    }
    return this;
  }

  /**
   * TODO: description
   */
  public onUpdate(cb: AudioGraphUpdateHandler): AudioGraph {
    if (!this._onUpdate.includes(cb)) {
      this._onUpdate.push(cb);
    }
    return this;
  }

  /**
   * TODO: description
   */
  public offUpdate(cb: AudioGraphUpdateHandler): AudioGraph {
    const i = this._onUpdate.indexOf(cb);
    if (i >= 0) {
      this._onUpdate.splice(i, 1);
    }
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
            this.nodes.worklet!.connect(this.nodes.input);
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
    let node: Nullable<AudioNode> = null;
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
      case AudioGraphFilterNode.WORKLET:
        node = this.nodes.filter.worklet;
        break;
      default:
        throw new Error('invalid filter ' + String(node));
    }

    this.nodes.input.disconnect();
    for (const k in this.nodes.filter) {
      if (Object.prototype.hasOwnProperty.call(this.nodes.filter, k)) {
        const node_ = this.nodes.filter[k as keyof AudioGraphFilters];
        if (node_ !== null) {
          node_.disconnect();
        }
      }
    }

    if (node === null) {
      if (filter === AudioGraphFilterNode.WORKLET) {
        void this.workletFilterReady.then(() => {
          node = this.nodes.filter.worklet;
          if (node === null) {
            console.error('no worklet filter node');
            return;
          }
          this.nodes.input.connect(node);
          node.connect(this.nodes.filteredInput);
        });
      } else {
        this.nodes.input.connect(this.nodes.filteredInput);
      }
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
  public setBiquad(state: BiquadState): AudioGraph {
    const node = this.nodes.filter.biquad;
    node.type = state.type;
    node.frequency.value = state.frequency;
    node.detune.value = state.detune;
    node.gain.value = state.gain;
    node.Q.value = state.q;
    return this;
  }

  /**
   * TODO: description
   */
  public setPitchShifter(state: PitchShifterState): AudioGraph {
    const node = this.nodes.filter.pitchShifter;
    node.shift = state.shift;
    node.bufferTime = state.bufferTime;
    return this;
  }

  /**
   * TODO: description
   */
  public setIir(state: IirState): AudioGraph {
    const node = this.context.createIIRFilter(
      state.feedforward,
      state.feedback
    );
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
  public setConvolver(state: ConvolverState): AudioGraph {
    const data = AudioMath.impulseResponse(
      this.sampleRate,
      state.duration,
      state.decay,
      state.frequency,
      state.overtones,
      state.overtoneDecay
    );
    const buffer = this.context.createBuffer(
      2,
      this.context.sampleRate * state.duration,
      this.context.sampleRate
    );
    for (let i = 0; i < buffer.numberOfChannels; ++i) {
      buffer.copyToChannel(data, i);
    }
    this.nodes.filter.convolver.buffer = buffer;
    return this;
  }

  /**
   * TODO: description
   */
  public setWorkletNodeParameters(
    node: AnyScriptNode,
    params: Record<string, number>
  ) {
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const param: AudioParam = node.parameters.get(key);
        param.value = Number(params[key]);
      }
    }
  }

  /**
   * TODO: description
   */
  public setWorkletSourceParameters(
    params: Record<string, number>
  ): Promise<void> {
    return this.workletReady.then(() => {
      this.setWorkletNodeParameters(this.nodes.worklet!, params);
    });
  }

  /**
   * TODO: description
   */
  public setWorkletFilterParameters(
    params: Partial<WorkletFilterState>
  ): Promise<void> {
    return this.workletFilterReady.then(() => {
      this.setWorkletNodeParameters(this.nodes.filter.worklet!, params as any);
    });
  }

  /**
   * TODO: description
   */
  public createAnalyserNode(): AnalyserNode {
    const node = this.context.createAnalyser();
    node.fftSize = this.fftSize;
    node.maxDecibels = this.maxDecibels;
    node.minDecibels = this.minDecibels;
    node.smoothingTimeConstant = this.smoothing;
    return node;
  }

  /**
   * TODO: description
   */
  public resetAnalyserNode(): AudioGraph {
    this.nodes.analyser.disconnect();
    this.nodes.filteredInput.disconnect();

    this.nodes.analyser = this.createAnalyserNode();
    this.nodes.filteredInput.connect(this.nodes.analyser);
    this.nodes.analyser.connect(this.nodes.output);

    const arr = new Float32Array(this.fftSize / 2);
    arr.fill(this.minDecibels);
    this.fdata = arr;

    return this;
  }

  /**
   * TODO: description
   */
  public clearData(): AudioGraph {
    this.tdata.fill(0);
    this.fdata.fill(this.minDecibels);
    for (const p of this.pitch) {
      p.value = 0;
    }
    return this;
  }

  /**
   * TODO: description
   * @param d
   */
  public indexOfFrequency(f: number): number {
    return Math.round((f * this.fftSize) / this.sampleRate);
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
  public setDevice(dev: Nullable<MediaDeviceInfo | string>): Promise<void> {
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
  public setElement(el: Nullable<HTMLAudioElement>): AudioGraph {
    if (this.nodes.element) {
      this.nodes.element.disconnect();
      this.nodes.element = null;
    }
    if (el !== null) {
      this.nodes.element = this.context.createMediaElementSource(el);
      this.nodes.element.connect(this.nodes.input);
    }
    return this;
  }

  /**
   * TODO: description
   */
  public getData(): AudioGraph {
    let nan = false;

    const node = this.nodes.analyser;

    this.tdata = AudioMath.resize(this.tdata, node.fftSize);
    node.getFloatTimeDomainData(this.tdata);

    this.fdata = AudioMath.resize(this.fdata, node.frequencyBinCount);
    node.getFloatFrequencyData(this.fdata);
    for (let i = 0; i < this.fdata.length; ++i) {
      const db = this.fdata[i];
      if (isNaN(db)) {
        nan = true;
      }
      this.fdata[i] = Math.min(
        Math.max(this.minDecibels, db),
        this.maxDecibels
      );
    }

    const threshold =
      this.minDecibels + this.threshold * (this.maxDecibels - this.minDecibels);
    this.canAnalyse = !nan && this.fdata.some(f => f > threshold);

    /*if (nan) {
      this.resetAnalyserNode();
    }*/

    return this;
  }

  /**
   * TODO: description
   */
  public analyseData(): AudioGraph {
    for (const pd of this.pitch) {
      if (!pd.enabled) {
        pd.value = -1;
        continue;
      }
      if (this.paused && pd.value >= 0) {
        continue;
      }
      pd.value = pd.calc();
    }

    return this;
  }

  /**
   * TODO: description
   */
  public update() {
    let updated = false;
    let analysed = false;
    if (this.paused) {
      /*if (this.canAnalyse && this.stateChanged) {
        analysed = true;
        this.analyseData();
        this.stateChanged = false;
      }*/
    } else {
      updated = true;
      this.getData();
      if (this.canAnalyse) {
        analysed = true;
        this.analyseData();
      }
    }
    for (const cb of this._onUpdate) {
      cb(updated, analysed);
    }
  }

  /**
   * TODO: description
   */
  private _updateLoop() {
    this.update();
    if (this.updating) {
      this._frame = requestAnimationFrame(this._updateLoopBound);
    }
  }

  /**
   * TODO: description
   * @param i
   */
  public zcr(): number {
    let res: number = AudioMath.zcr(this.tdata);
    res *= this.sampleRate;
    res = AudioMath.clampPitch(res, this.minPitch, this.maxPitch);
    return res;
  }

  /**
   * TODO: description
   * @param i
   */
  public fftmax(): number {
    const fdata = this.fdata;
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
  public fftpeak(): number {
    const fdata = this.fdata;
    const fscale: number = this.fftSize / this.sampleRate;
    const start: number = Math.floor(this.minPitch * fscale);
    const end: number = Math.floor(this.maxPitch * fscale) + 1;

    const prominence = AudioMath.prominence(
      this.fdata,
      this.prominenceData,
      this.fftPeakType,
      start,
      end,
      this.prominenceRadius,
      this.minDecibels,
      this.maxDecibels,
      this.prominenceThreshold,
      this.prominenceNormalize
    );

    this.prominenceData = prominence.value;
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
  public autocorr(): number {
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
