import { fixWasmImports } from '../../utils';
import * as wasmModule from '../../wasm/index.c';
import { WasmBuffer } from '../wasm-buffer/wasm-buffer';
import {
  AudioMathWasmFunctions,
  FftPeakMask,
  FftPeakType,
  PeakDistance,
  Peaks,
} from './interfaces';

export class AudioMathInstance {
  /**
   * Constructor.
   */
  constructor(public readonly wasm: WasmModule<AudioMathWasmFunctions>) {}

  /**
   * TODO: description
   */
  public static async create(): Promise<AudioMathInstance> {
    const init: WasmModuleFactory<AudioMathWasmFunctions> = wasmModule.init;
    if (!init) {
      throw new Error('wasm module not found');
    }
    const wasm: WasmModule<AudioMathWasmFunctions> = await init(
      (imports: WasmImports) => {
        fixWasmImports(imports);
        return imports;
      }
    );
    return new AudioMathInstance(wasm);
  }

  /**
   * TODO: description
   */
  public createBuffer<T extends TypedArray>(
    type: FilterKeysByType<WasmMemory, T>
  ): WasmBuffer<T> {
    return new WasmBuffer<T>(this.wasm, type);
  }

  /**
   * TODO: description
   * @param x
   * @param min
   * @param max
   */
  public clamp(x: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, x));
  }

  /**
   * TODO: description
   * @param factor
   * @param prev
   * @param cur
   */
  public smooth(factor: number, prev: number, cur: number): number {
    return factor * prev + (1 - factor) * cur;
  }

  /**
   * TODO: description
   * @param peak
   * @param left
   * @param right
   */
  public interpolatePeak<T extends TypedArray>(data: T, peak: number): number {
    if (peak > 0 || peak < data.length - 1) {
      const c = data[peak];
      const b = (data[peak + 1] - data[peak - 1]) / 2;
      const a = data[peak - 1] + b - c;
      if (Math.abs(a) > 1e-4) {
        peak += -b / (2 * a);
      }
    }
    return peak;
  }

  /**
   * TODO: description
   * @param p
   * @param min
   * @param max
   */
  public clampPitch(p: number, min: number, max: number): number {
    if (p > max) {
      const scale = Math.ceil(p / max);
      p /= scale;
      if (p < min) {
        p = max;
      }
    } else if (p < min) {
      const scale = Math.ceil(min / p);
      p *= scale;
      if (p > max) {
        p = min;
      }
    }
    return p;
  }

  /**
   * TODO: description
   */
  public getMidiNumber(frequency: number): number {
    return 69 + 12 * Math.log2(frequency / 440);
  }

  /**
   * TODO: description
   * @param arr
   * @param size
   */
  public resize<T extends TypedArray>(arr: T, size: number, fill = 0): T {
    if (arr.length !== size) {
      arr = new (arr.constructor as TypedArrayConstructor<T>)(size);
      arr.fill(fill);
    }
    return arr;
  }

  /**
   * TODO: description
   * @param data
   */
  public mean<T extends NumberArray>(data: T): number {
    if (!data.length) {
      return 0;
    }
    return data.reduce((s: number, x: number) => s + x) / data.length;
  }

  /**
   * TODO: description
   * @param data
   * @param start
   * @param end
   */
  public indexOfMax<T extends TypedArray>(
    data: T,
    start = 0,
    end: number = data.length - 1
  ): number {
    if (!data.length) {
      return NaN;
    }

    start = this.clamp(start, 0, data.length);
    end = this.clamp(end, 0, data.length);

    let res = -1;
    let max = -Infinity;
    for (let i = start; i <= end; ++i) {
      if (max < data[i]) {
        res = i;
        max = data[i];
      }
    }
    return res >= 0 ? res : NaN;
  }

  /**
   * TODO: description
   * @param data
   * @param start
   * @param end
   */
  public indexOfMaxPeak<T extends TypedArray>(
    data: T,
    start = 1,
    end: number = data.length - 2
  ): number {
    if (!data.length) {
      return NaN;
    }

    start = this.clamp(start, 1, data.length - 2);
    end = this.clamp(end, 1, data.length - 2);

    let res = -1;
    let max = -Infinity;
    for (let i = start; i <= end; ++i) {
      if (data[i] < Math.max(data[i - 1], data[i + 1], max)) {
        continue;
      }
      if (data[i] === data[i - 1] && data[i] === data[i + 1]) {
        continue;
      }
      res = i;
      max = data[i];
    }
    return res >= 0 ? res : NaN;
  }

  /**
   * TODO: description
   * @param data
   */
  public zcr<T extends TypedArray>(data: T): number {
    if (!data.length) {
      return 0;
    }
    const mean = this.mean(data);
    let res = 0;
    let prevSign = data[0] > mean;
    for (let i = 1; i < data.length; i += 1) {
      const sign = data[i] > mean;
      res += Number(sign !== prevSign);
      prevSign = sign;
    }
    return res / (2 * data.length);
  }

  /**
   * TODO: description
   * @param data
   */
  public rms(data: WasmBuffer<Float32Array>): number {
    return this.wasm.exports.rms(data.pointer, data.length);
  }

  /**
   * TODO: description
   */
  public autocorr(
    tdata: WasmBuffer<Float32Array>,
    minOffset: number,
    maxOffset: number,
    output: WasmBuffer<Float32Array>
  ): void {
    output.length = tdata.length;
    this.wasm.exports.autocorr(
      tdata.pointer,
      output.pointer,
      tdata.length,
      minOffset,
      maxOffset
    );
  }

  /**
   * TODO: description
   */
  public autocorrpeak(
    acdata: WasmBuffer<Float32Array>,
    minOffset: number,
    maxOffset: number
  ): number {
    const ret = this.wasm.exports.autocorrpeak(
      acdata.pointer,
      acdata.length,
      minOffset,
      maxOffset
    );
    return ret > 0 ? ret : NaN;
  }

  /**
   * TODO: description
   */
  public prominence(
    fft: WasmBuffer<Float32Array>,
    peaks: Peaks,
    output: WasmBuffer<Float32Array>,
    start: number,
    end: number,
    radius: number,
    normalize = false
  ): void {
    output.length = fft.length;
    this.wasm.exports.prominence(
      fft.pointer,
      peaks.data.pointer,
      output.pointer,
      fft.length,
      peaks.count,
      start,
      end,
      radius,
      normalize
    );
  }

  /**
   * TODO: description
   */
  public prominencepeak(
    prominence: WasmBuffer<Float32Array>,
    peakType: FftPeakType = FftPeakType.MIN_FREQUENCY,
    start = 0,
    end: number = prominence.length,
    threshold = 10
  ): number {
    const ret = this.wasm.exports.prominencepeak(
      prominence.pointer,
      prominence.length,
      start,
      end,
      threshold,
      peakType
    );
    return ret > 0 ? ret : NaN;
  }

  /**
   * TODO: description
   */
  public cepstrum(
    fft: WasmBuffer<Float32Array>,
    output: WasmBuffer<Float32Array>
  ): void {
    if (fft.length < 2) {
      return;
    }
    output.length = 1 + Math.floor(fft.length / 2);
    this.wasm.exports.cepstrum(fft.pointer, output.pointer, fft.length * 2);
  }

  /**
   * TODO: description
   */
  public fftpeaks(
    fft: WasmBuffer<Float32Array>,
    output: Peaks,
    mask: FftPeakMask,
    maskRadius: number
  ): void {
    output.data.length = fft.length;
    output.count = this.wasm.exports.fftpeaks(
      fft.pointer,
      output.data.pointer,
      fft.length,
      mask,
      maskRadius
    );
  }

  /**
   * TODO: description
   */
  public fftharmonics(
    f0: number,
    fftpeaks: Peaks,
    output: Peaks,
    searchRadius = 0.3
  ): void {
    output.data.length = fftpeaks.data.length;
    output.count = this.wasm.exports.fftharmonics(
      fftpeaks.data.pointer,
      output.data.pointer,
      fftpeaks.data.length,
      fftpeaks.count,
      f0,
      searchRadius
    );
  }

  /**
   * TODO: description
   */
  public mpd(fftpeaks: Peaks, output: PeakDistance): void {
    output.histogram.length = fftpeaks.data.length;
    output.median = this.wasm.exports.mpd(
      fftpeaks.data.pointer,
      output.histogram.pointer,
      fftpeaks.data.length,
      fftpeaks.count
    );
    if (output.median < 0) {
      output.median = NaN;
    }
  }

  /**
   * TODO: description
   */
  public f0(values: number[], maxRange = 0.3): number {
    const mean = this.mean(values);
    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    if (max - min > maxRange * mean) {
      return NaN;
    }
    return mean;
  }

  /**
   * TODO: description
   * @param sampleRate
   * @param duration
   * @param decay
   * @param frequency
   * @param overtones
   * @param overtoneDecay
   */
  public impulseResponse(
    sampleRate: number,
    duration: number,
    decay: number,
    frequency: number,
    overtones: number,
    overtoneDecay: number
  ): Float32Array {
    const eps = 1e-4;
    const w = frequency * 2 * Math.PI;
    const size = sampleRate * duration;
    const ret = new Float32Array(size);
    const harmonics = overtones + 1;
    for (let i = 0; i < size; ++i) {
      const t = i / sampleRate;
      const a = Math.exp(-decay * t);
      if (a < eps) {
        break;
      }
      const wt = w * t;
      let wave = 0;
      for (let h = 1; h <= harmonics; ++h) {
        wave += Math.cos(h * wt) * Math.exp(-overtoneDecay * (h - 1));
      }
      ret[i] = a * wave;
    }
    return ret;
  }

  /**
   * TODO: description
   */
  public sawtoothWave(
    sampleRate: number,
    duration: number,
    phase = 0,
    reverse = false
  ): Float32Array {
    const size = sampleRate * duration;
    const ret = new Float32Array(size);
    const offset = Math.round((size * phase) / 360);
    for (let i = 0; i < size; ++i) {
      ret[i] = ((i + offset) % size) / size;
      if (reverse) {
        ret[i] = 1 - ret[i];
      }
    }
    return ret;
  }

  /**
   * TODO: description
   */
  public triangleWave(
    sampleRate: number,
    duration: number,
    phase = 0
  ): Float32Array {
    const size = sampleRate * duration;
    const size2 = size / 2;
    const ret = new Float32Array(size);
    const offset = Math.round((size * phase) / 360);
    for (let i = 0; i < size; ++i) {
      ret[i] = 1 - Math.abs(((i + offset) % size) - size2) / size2;
    }
    return ret;
  }

  /**
   * TODO: description
   */
  public fadeWave(
    sampleRate: number,
    duration: number,
    phase = 0
  ): Float32Array {
    const size = sampleRate * duration;
    const size2 = size / 2;
    const ret = new Float32Array(size);
    const offset = Math.round((size * phase) / 360);
    for (let i = 0; i < size; ++i) {
      const j = (i + offset) % size;
      if (j < size2) {
        ret[i] = Math.sqrt(j / size2);
      } else {
        ret[i] = Math.sqrt(2 - j / size2);
      }
    }
    return ret;
  }
}

export class AudioMath {
  private static instance: Nullable<AudioMathInstance> = null;

  private static initPromise: Nullable<Promise<AudioMathInstance>> = null;

  public static async init(): Promise<AudioMathInstance> {
    if (this.initPromise === null) {
      this.initPromise = AudioMathInstance.create();
    }
    const instance = await this.initPromise;
    AudioMath.instance = instance;
    return instance;
  }

  public static get(): AudioMathInstance {
    if (AudioMath.instance === null) {
      throw new Error('audio math is not initialized');
    }
    return AudioMath.instance;
  }

  public static async getOrCreate(): Promise<AudioMathInstance> {
    return AudioMath.init();
  }
}
