import { AudioMath } from '../audio-math/audio-math';
import { PitchShifterNode } from '../pitch-shifter-node/pitch-shifter-node';
import { WorkletNodeFactory } from '../worklet-node-factory/worklet-node-factory';
import {
  AnyScriptNode,
  FilterProcessor,
  GeneratorProcessor,
} from '../worklet-processor';
import {
  AudioGraphFilterNode,
  AudioGraphFilters,
  AudioGraphNodes,
  AudioGraphSourceNode,
  AudioGraphState,
  AudioGraphUpdateHandler,
  BiquadState,
  ConvolverState,
  IirState,
  PitchShifterState,
  WorkletFilterState,
} from './interfaces';

export class AudioGraph {
  public nodes: AudioGraphNodes;

  public stream: MediaStream;

  public filter: AudioGraphFilterNode = AudioGraphFilterNode.NONE;

  private _frame = 0;

  private readonly _updateLoopBound = this._updateLoop.bind(this);

  private readonly _onUpdate: AudioGraphUpdateHandler[] = [];

  public updating = false;

  public paused = true;

  public suspended = true;

  public deviceLoading = false;

  public deviceStream: Nullable<MediaStream> = null;

  public volume = 0.5;

  public autoResetAnalyserNode = false;

  public readonly minDecibels = -100;

  public readonly maxDecibels = 0;

  public readonly maxDelay = 5;

  public readonly fftSizes: number[] = [
    32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768,
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
  constructor(
    public readonly context: AudioContext,
    workletSource: AnyScriptNode,
    workletFilter: AnyScriptNode
  ) {
    this.nodes = {
      wave: this.context.createOscillator(),
      worklet: workletSource,
      device: null,
      element: null,
      input: this.context.createDelay(this.maxDelay),
      filter: {
        iir: this.context.createIIRFilter([1, 0, 0], [1, 0, 0]),
        biquad: this.context.createBiquadFilter(),
        convolver: this.context.createConvolver(),
        pitchShifter: new PitchShifterNode(this.context),
        worklet: workletFilter,
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
  }

  /**
   * TODO: description
   */
  public static async create(): Promise<AudioGraph> {
    if (!window.AudioContext) {
      throw new Error('Web Audio API is not supported');
    }
    const context = new AudioContext();
    await context.suspend();

    const workletFactory = new WorkletNodeFactory(context);

    const math = await AudioMath.getOrCreate();
    const wasm = math.wasm;

    const workletSource = await workletFactory.create(GeneratorProcessor);
    const workletFilter = await workletFactory.create(FilterProcessor);
    workletFilter.port.postMessage({
      type: 'init',
      module: wasm.raw.module,
      memorySize: wasm.emModule.buffer.byteLength,
      sampleRate: context.sampleRate,
    });

    return new AudioGraph(context, workletSource, workletFilter);
  }

  /**
   * TODO: description
   * @param state
   */
  public setState(state: AudioGraphState) {
    this.volume = state.volume;
    this.nodes.input.delayTime.value = state.delay;
    this.fftSize = state.fftSize;
    this.smoothing = state.smoothing;

    this.nodes.wave.type = state.wave.shape;
    this.nodes.wave.frequency.value = state.wave.frequency;

    this.setFilter(state.filter.id);

    this.setIir(state.filter.iir);
    this.setBiquad(state.filter.biquad);
    this.setPitchShifter(state.filter.pitchShifter);
    this.setConvolver(state.filter.convolver);

    this.setWorkletSourceParameters(state.worklet);
    this.setWorkletFilterParameters(state.filter.worklet);
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
    this.nodes.worklet.port.postMessage({ type: 'stop' });
    this.nodes.filter.worklet.port.postMessage({ type: 'stop' });
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
  public enable(node: AudioGraphSourceNode, data?: any) {
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
        //console.log(this.nodes.worklet);
        this.nodes.worklet.connect(this.nodes.input);
        break;
      default:
        throw new Error('invalid node ' + String(node));
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
    const data = AudioMath.get().impulseResponse(
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
        const param: Optional<AudioParam> = node.parameters.get(key);
        if (param) {
          param.value = Number(params[key]);
        } else {
          console.warn('setWorkletNodeParameters', key);
        }
      }
    }
  }

  /**
   * TODO: description
   */
  public setWorkletSourceParameters(params: Record<string, number>): void {
    this.setWorkletNodeParameters(this.nodes.worklet, params);
  }

  /**
   * TODO: description
   */
  public setWorkletFilterParameters(params: Partial<WorkletFilterState>): void {
    this.setWorkletNodeParameters(this.nodes.filter.worklet, params as any);
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

    return this;
  }

  /**
   * TODO: description
   */
  public async getDevices(): Promise<MediaDeviceInfo[]> {
    if (!navigator?.mediaDevices?.enumerateDevices) {
      throw new Error('enumerateDevices is not supported');
    }
    const devs = await navigator.mediaDevices.enumerateDevices();
    return devs.filter(dev => dev.kind === 'audioinput');
  }

  /**
   * TODO: description
   * @param dev
   */
  public async setDevice(
    dev: Nullable<MediaDeviceInfo | string>
  ): Promise<void> {
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
      return;
    } else if (typeof dev === 'string') {
      deviceId = dev;
    } else {
      deviceId = dev.deviceId;
    }
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('getUserMedia is not supported');
    }
    if (this.deviceLoading) {
      throw new Error('already setting device');
    }
    this.deviceLoading = true;
    try {
      this.deviceStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { deviceId },
      });
      this.nodes.device = this.context.createMediaStreamSource(
        this.deviceStream
      );
      this.nodes.device.connect(this.nodes.input);
    } finally {
      this.deviceLoading = false;
    }
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
  public update() {
    for (const cb of this._onUpdate) {
      cb(this.paused);
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
}
