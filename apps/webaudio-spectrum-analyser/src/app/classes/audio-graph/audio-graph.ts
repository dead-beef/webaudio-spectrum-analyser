export interface AudioGraphNodes {
  wave: OscillatorNode,
  element: MediaElementAudioSourceNode,
  device: MediaStreamAudioSourceNode,
  input: DelayNode,
  analysers: AnalyserNode[],
  output: MediaStreamAudioDestinationNode
}

export class AudioGraph {
  public context: AudioContext = null;
  public nodes: AudioGraphNodes = null;
  public stream: MediaStream = null;  public paused = true;
  public suspended = true;
  public deviceLoading = false;
  public deviceStream: MediaStream = null;

  readonly minDecibels = -100;
  readonly maxDecibels = 0;
  readonly maxDelay = 5;
  readonly fastAnalyserSmoothing = 0.5;
  readonly slowAnalyserSmoothing = 0.99;
  readonly fftSizes: number[] = [
    32, 64, 128, 256, 512, 1024,
    2048, 4096, 8192, 16384, 32768
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

  constructor() {
    /*if(window.PREVIEW) {
      console.warn('preview');
      this.context = {
        sampleRate: 44000
      };
      this.nodes = {
        wave: {
          frequency: {value: 440},
          type: 'sine',
          connect: () => {}
        },
        input: {
          delayTime: {value: 0}
        },
        analysers: [null, null]
      };
      return;
    }*/

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

  createAnalysers() {
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

    this.nodes.analysers[0].smoothingTimeConstant = this.fastAnalyserSmoothing;
    this.nodes.analysers[1].smoothingTimeConstant = this.slowAnalyserSmoothing;

    this.nodes.analysers[0].connect(this.nodes.output);
    //this.nodes.analysers[1].connect(this.nodes.output);
  }

  getFrequencyData(analyser: number, dst?: Uint8Array): Uint8Array {
    const node = this.nodes.analysers[analyser];
    const length = node.frequencyBinCount;
    if(!dst || dst.length !== length) {
      dst = new Uint8Array(length);
    }
    node.getByteFrequencyData(dst);
    return dst;
  }

  getAverageFrequency(data: Uint8Array) {
    const sampleRate = this.context.sampleRate;
    const fftSize = data.length * 2;
    let sum = 0;
    let res = 0;
    for(let i = 0; i < data.length; ++i) {
      const frequency = i * sampleRate / fftSize;
      const value = data[i] / 255.0;
      sum += value;
      res += value * frequency;
    }
    return res / sum;
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

  setElement(el: HTMLAudioElement) {
    if(this.nodes.element) {
      this.nodes.element.disconnect();
      this.nodes.element = null;
    }
    if(!el) {
      return;
    }
    this.nodes.element = this.context.createMediaElementSource(el);
    this.nodes.element.connect(this.nodes.input);
  }
}
