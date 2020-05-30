import { AudioMath } from '../audio-math/audio-math';
import { AudioGraphNodes, PitchDetection } from '../../interfaces';


export class AudioGraph {
  public context: AudioContext = null;
  public nodes: AudioGraphNodes = null;
  public stream: MediaStream = null;
  public paused = true;
  public suspended = true;
  public deviceLoading = false;
  public deviceStream: MediaStream = null;

  public fdata: Uint8Array[] = [];
  public tdata: Uint8Array = new Uint8Array(1);
  public autocorrdata: Float32Array = new Float32Array(1);

  public minPitch = 20;
  public maxPitch = 20000;
  public debug = false;

  readonly minDecibels = -100;
  readonly maxDecibels = 0;
  readonly maxDelay = 5;
  readonly fastAnalyserSmoothing = 0.5;
  readonly slowAnalyserSmoothing = 0.99;
  readonly fftSizes: number[] = [
    32, 64, 128, 256, 512, 1024,
    2048, 4096, 8192, 16384, 32768
  ];

  readonly pitch: PitchDetection[] = [
    {
      name: 'Zero-crossing rate',
      short: 'ZCR',
      calc: this.zcr.bind(this),
      smooth: true,
      enabled: true,
      value: 0.0
    },
    {
      name: 'FFT max',
      short: 'FFTM',
      calc: this.fftmax.bind(this),
      smooth: false,
      enabled: false,
      value: 0.0
    },
    {
      name: 'FFT peak',
      short: 'FFTP',
      calc: this.fftpeak.bind(this),
      smooth: false,
      enabled: false,
      value: 0.0
    },
    {
      name: 'Autocorrelation',
      short: 'AC',
      calc: this.autocorr.bind(this),
      smooth: true,
      enabled: false,
      value: 0.0
    }
  ];

  private _fftSize = 2048;
  get fftSize(): number {
    return this._fftSize;
  }
  set fftSize(size: number) {
    if(this.nodes && this.nodes.analysers) {
      for(const node of this.nodes.analysers) {
        node.fftSize = size;
      }
    }
    this._fftSize = size;
  }

  get sampleRate(): number {
    return this.context.sampleRate;
  }

  constructor() {
    // @ts-ignore
    if(window.PREVIEW) {
      console.warn('preview');
      // @ts-ignore
      this.context = {
        sampleRate: 44000
      };
      // @ts-ignore
      this.nodes = {
        wave: {
          // @ts-ignore
          frequency: {value: 440},
          type: 'sine',
          // @ts-ignore
          connect: () => {}
        },
        input: {
          // @ts-ignore
          delayTime: {value: 0}
        },
        analysers: [null, null]
      };
      return;
    }

    if(!window.AudioContext) {
      throw new Error('Web Audio API is not supported');
    }
    this.context = new AudioContext();
    this.context.suspend();

    this.nodes = {
      wave: this.context.createOscillator(),
      device: null,
      element: null,
      input: this.context.createDelay(this.maxDelay),
      analysers: null,
      output: this.context.createMediaStreamDestination(),
    };
    this.nodes.wave.start();
    this.createAnalysers();
    this.stream = this.nodes.output.stream;
  }

  destroy() {
    if(this.context) {
      this.context.close();
      this.context = null;
      this.nodes = null;
    }
    if(this.stream) {
      this.stream.getTracks()
        .forEach(track => track.stop());
      this.stream = null;
    }
  }

  play(): AudioGraph {
    if(this.suspended) {
      this.context.resume();
      this.suspended = false;
    }
    if(this.paused) {
    }
    this.paused = false;
    return this;
  }

  pause(): AudioGraph {
    if(!this.paused) {
    }
    this.paused = true;
    return this;
  }

  enable(node: string, data?: any): AudioGraph {
    console.log('enable', node/*, data*/);
    switch(node) {
      case 'device':
        //this.setDevice(null);
        break;
      case 'file':
        this.setElement(data);
        break;
      default:
        this.nodes[node].connect(this.nodes.input);
    }
    return this;
  }
  disable(node: string): AudioGraph {
    console.log('disable', node);
    switch(node) {
      case 'device':
        this.setDevice(null);
        break;
      case 'file':
        this.setElement(null);
        break;
      default:
        this.nodes[node].disconnect();
    }
    return this;
  }

  createAnalysers(): AudioGraph {
    if(this.nodes.analysers) {
      for(const node of this.nodes.analysers) {
        node.disconnect();
      }
      this.nodes.input.disconnect();
    }

    this.nodes.analysers = [
      this.context.createAnalyser(),
      this.context.createAnalyser()
    ];
    for(const node of this.nodes.analysers) {
      node.fftSize = this.fftSize;
      node.maxDecibels = this.maxDecibels;
      node.minDecibels = this.minDecibels;
      this.nodes.input.connect(node);
    }

    while(this.fdata.length < this.nodes.analysers.length) {
      this.fdata.push(new Uint8Array(this.fftSize / 2));
    }

    this.nodes.analysers[0].smoothingTimeConstant = this.fastAnalyserSmoothing;
    this.nodes.analysers[1].smoothingTimeConstant = this.slowAnalyserSmoothing;

    this.nodes.analysers[0].connect(this.nodes.output);
    //this.nodes.analysers[1].connect(this.nodes.output);

    return this;
  }

  clearData(): AudioGraph {
    this.tdata.fill(0);
    for(const d of this.fdata) {
      d.fill(0);
    }
    for(const p of this.pitch) {
      p.value = 0;
    }
    return this;
  }

  byteToDecibels(d: number): number {
    return d / 255.0 * (this.maxDecibels - this.minDecibels) + this.minDecibels;
  }

  getDevices(): Promise<MediaDeviceInfo[]> {
    if(!(navigator.mediaDevices
         && navigator.mediaDevices.enumerateDevices)) {
      return Promise.reject(new Error('enumerateDevices is not supported'));
    }
    return navigator.mediaDevices.enumerateDevices()
      .then(ds => ds.filter(d => d.kind === 'audioinput'));
  }

  setDevice(dev: MediaDeviceInfo): Promise<void> {
    if(this.deviceStream) {
      this.deviceStream.getTracks()
        .forEach(track => track.stop());
      this.deviceStream = null;
    }
    if(this.nodes.device) {
      this.nodes.device.disconnect();
      this.nodes.device = null;
    }
    if(dev === null) {
      return Promise.resolve();
    }
    if(!(navigator.mediaDevices
         && navigator.mediaDevices.getUserMedia)) {
      return Promise.reject(new Error('getUserMedia is not supported'));
    }
    if(this.deviceLoading) {
      return Promise.reject(new Error('already setting device'));
    }
    const res = navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        deviceId: dev.deviceId
      }
    }).then(stream => {
      this.deviceStream = stream;
      this.nodes.device = this.context
        .createMediaStreamSource(this.deviceStream);
      this.nodes.device.connect(this.nodes.input);
    }).finally(() => { this.deviceLoading = false; });
    this.deviceLoading = true;
    return res;
  }

  setElement(el: HTMLAudioElement): AudioGraph {
    if(this.nodes.element) {
      this.nodes.element.disconnect();
      this.nodes.element = null;
    }
    if(el) {
      this.nodes.element = this.context.createMediaElementSource(el);
      this.nodes.element.connect(this.nodes.input);
    }
    return this;
  }

  analyse(): AudioGraph {
    if(!this.paused) {
      for(let i = 0; i < this.nodes.analysers.length; ++i) {
        const node = this.nodes.analysers[i];
        if(i === 0) {
          this.tdata = AudioMath.resize(this.tdata, node.fftSize);
          node.getByteTimeDomainData(this.tdata);
        }
        this.fdata[i] = AudioMath.resize(
          this.fdata[i],
          node.frequencyBinCount
        );
        node.getByteFrequencyData(this.fdata[i]);
      }
    }

    for(const pd of this.pitch) {
      if(pd.enabled) {
        pd.value = pd.calc();
      }
      else {
        pd.value = 0;
      }
    }

    return this;
  }

  zcr(): number {
    let res: number = AudioMath.zcr(this.tdata);
    res *= this.sampleRate;
    return res;
  }

  fftmax(): number {
    const fscale: number = this.fftSize / this.sampleRate;
    let res: number = AudioMath.indexOfMax(this.fdata[this.fdata.length - 1]);
    res /= fscale;
    return res;
  }

  fftpeak(): number {
    const fscale: number = this.fftSize / this.sampleRate;
    const start: number = Math.floor(this.minPitch * fscale);
    const end: number = Math.floor(this.maxPitch * fscale) + 1;
    let res: number = AudioMath.indexOfPeak(
      this.fdata[this.fdata.length - 1],
      start, end
    );
    res /= fscale;
    return res;
  }

  autocorr(): number {
    const start = Math.floor(this.sampleRate / this.maxPitch);
    const end = Math.floor(this.sampleRate / this.minPitch) + 1;
    this.autocorrdata = AudioMath.autocorr(
      this.tdata,
      start, end,
      this.autocorrdata
    );
    let res: number = AudioMath.indexOfAutocorrPeak(
      this.autocorrdata,
      start, end
    );
    res = this.sampleRate / res;
    return res;
  }

}
