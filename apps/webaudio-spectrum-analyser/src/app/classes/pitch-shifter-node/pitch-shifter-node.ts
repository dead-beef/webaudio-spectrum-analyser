import { AudioMath } from '../audio-math/audio-math';
import { IPitchShifterNode } from './interfaces';

export class PitchShifterNode extends GainNode implements IPitchShifterNode {
  public readonly shiftUp: AudioBufferSourceNode[];

  public readonly shiftDown: AudioBufferSourceNode[];

  public readonly shiftGain: GainNode[];

  public readonly fade: AudioBufferSourceNode[];

  public readonly delay: DelayNode[];

  public readonly mix: GainNode[];

  public readonly output: GainNode;

  public readonly maxDelay = 4;

  private _bufferTime = 0.1;

  private _shift = 0;

  private _shiftingDown = true;

  /**
   * Getter.
   */
  public get bufferTime(): number {
    return this._bufferTime;
  }

  /**
   * Setter.
   * @param time
   */
  public set bufferTime(time: number) {
    for (let i = 0; i < 2; ++i) {
      this._createOscillator(
        this.context,
        AudioMath.sawtoothWave(this.context.sampleRate, time, i * 180),
        this.shiftDown[i]
      );
      this._createOscillator(
        this.context,
        AudioMath.sawtoothWave(this.context.sampleRate, time, i * 180, true),
        this.shiftUp[i]
      );
      this._createOscillator(
        this.context,
        AudioMath.triangleWave(this.context.sampleRate, time, i * 180),
        this.fade[i]
      );
    }
    this._bufferTime = time;
    this.shift = this._shift;
  }

  /**
   * Getter.
   */
  public get shift(): number {
    return this._shift;
  }

  /**
   * Setter.
   * @param shift
   */
  public set shift(shift: number) {
    this._shift = shift;
    const shiftDown = shift < 0;
    const shiftGain = 0.5 * this.bufferTime * Math.abs(shift);
    if (shiftDown !== this._shiftingDown) {
      this._shiftingDown = shiftDown;
      for (let i = 0; i < 2; ++i) {
        if (shiftDown) {
          this.shiftUp[i].disconnect();
          this.shiftDown[i].connect(this.shiftGain[i]);
        } else {
          this.shiftDown[i].disconnect();
          this.shiftUp[i].connect(this.shiftGain[i]);
        }
      }
    }
    for (let i = 0; i < 2; ++i) {
      this.shiftGain[i].gain.value = shiftGain;
    }
  }

  /**
   * Constructor.
   */
  constructor(ctx: BaseAudioContext, opts?: any) {
    super(ctx, opts);

    this.shiftDown = [ctx.createBufferSource(), ctx.createBufferSource()];
    this.shiftUp = [ctx.createBufferSource(), ctx.createBufferSource()];
    this.shiftGain = [ctx.createGain(), ctx.createGain()];
    this.fade = [ctx.createBufferSource(), ctx.createBufferSource()];
    this.mix = [ctx.createGain(), ctx.createGain()];
    this.delay = [
      ctx.createDelay(this.maxDelay),
      ctx.createDelay(this.maxDelay),
    ];
    this.output = ctx.createGain();

    for (let i = 0; i < 2; ++i) {
      this.connect(this.delay[i]);
      this.delay[i].connect(this.mix[i]);
      this.mix[i].connect(this.output);
      this.mix[i].gain.value = 0;
      this.fade[i].connect(this.mix[i].gain);
      this.shiftDown[i].connect(this.shiftGain[i]);
      this.shiftGain[i].connect(this.delay[i].delayTime);
    }

    this.connect = this.output.connect.bind(this.output);
    this.disconnect = this.output.disconnect.bind(this.output);

    this.bufferTime = 0.1;
    this.start(this.context.currentTime);
  }

  /**
   * TODO: description
   */
  private _createOscillator(
    ctx: BaseAudioContext,
    wave: Float32Array,
    node?: AudioBufferSourceNode
  ): AudioBufferSourceNode {
    if (node?.buffer) {
      node.buffer.copyToChannel(wave, 0);
      node.buffer.copyToChannel(wave, 1);
      return node;
    }
    if (!node) {
      node = ctx.createBufferSource();
    }
    const buf = ctx.createBuffer(2, wave.length, ctx.sampleRate);
    buf.copyToChannel(wave, 0);
    buf.copyToChannel(wave, 1);
    node.buffer = buf;
    node.loop = true;
    return node;
  }

  /**
   * TODO: description
   */
  public start(time = 0) {
    for (const node of this.shiftUp) {
      node.start(time);
    }
    for (const node of this.shiftDown) {
      node.start(time);
    }
    for (const node of this.fade) {
      node.start(time);
    }
  }

  /**
   * TODO: description
   */
  public stop(time = 0) {
    for (const node of this.shiftUp) {
      try {
        node.stop(time);
      } catch (err) {}
    }
    for (const node of this.shiftDown) {
      try {
        node.stop(time);
      } catch (err) {}
    }
    for (const node of this.fade) {
      try {
        node.stop(time);
      } catch (err) {}
    }
  }
}
