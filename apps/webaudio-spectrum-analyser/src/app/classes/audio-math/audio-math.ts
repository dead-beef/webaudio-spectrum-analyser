import * as wasmModule from '../../wasm/index.c';
import {
  AudioMathWasmFunctions,
  FftPeakMask,
  FftPeakType,
  PeakDistance,
  Peaks,
  WasmBuffer,
} from './interfaces';

class AudioMathInstance {
  private _wasm: Nullable<WasmModule<AudioMathWasmFunctions>> = null;

  public wasmReady: Promise<WasmModule<AudioMathWasmFunctions>>;

  public wasmError: Nullable<Error> = null;

  public inputBuffer: WasmBuffer = {
    ptr: [],
    type: 40,
    byteLength: 0,
  };

  public outputBuffer: WasmBuffer = {
    ptr: [],
    type: 40,
    byteLength: 0,
  };

  /**
   * Getter.
   */
  public get wasm(): Nullable<WasmModule<AudioMathWasmFunctions>> {
    if (this._wasm !== null) {
      return this._wasm;
    }
    if (this.wasmError !== null) {
      throw this.wasmError;
    }
    return null;
  }

  /**
   * Setter.
   */
  public set wasm(wasm_: Nullable<WasmModule<AudioMathWasmFunctions>>) {
    this._wasm = wasm_;
  }

  /**
   * Constructor.
   */
  constructor() {
    const init: WasmModuleFactory<AudioMathWasmFunctions> | undefined =
      wasmModule.init;
    if (!init) {
      this.wasmError = new Error('wasm module not found');
      this.wasmReady = Promise.reject(this.wasmError);
    } else {
      this.wasmReady = init((imports: WasmImports) => {
        //console.warn('imports', imports);
        imports['emscripten_resize_heap'] = (...args) => {
          console.warn('emscripten_resize_heap', args);
        };
        imports['emscripten_memcpy_big'] = (...args) => {
          console.warn('emscripten_memcpy_big', args);
        };
        imports['segfault'] = () => {
          throw new Error('segfault');
        };
        imports['alignfault'] = () => {
          throw new Error('alignfault');
        };
        imports['abort'] = () => {
          throw new Error('aborted');
        };

        return imports;
      }).then((wasm_: WasmModule<AudioMathWasmFunctions>) => {
        /*if (!environment.production) {
          window['wasm'] = wasm_;
        }*/
        this.wasm = wasm_;
        return this.wasm;
      });
      this.wasmReady.catch((err: Error) => {
        console.error(err);
        this.wasmError = err;
      });
    }
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
  public clampPitch(p: number, min: number, max: number) {
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
   * @param buf
   * @param length
   */
  public resizeBuffer(
    buf: WasmBuffer,
    length: number,
    type: WasmMemoryType = 40
  ) {
    const wasm = this.wasm!;
    const byteLength = length * wasm.memoryManager.mem[type].BYTES_PER_ELEMENT;
    if (byteLength === buf.byteLength && buf.type === type) {
      return;
    }
    //console.log('realloc', buf);
    //console.log('  free', buf.ptr);
    wasm.memoryManager.free(buf.ptr, buf.type);
    //console.log('  malloc', length);
    buf.ptr = wasm.memoryManager.malloc(length, type);
    buf.byteLength = byteLength;
    buf.type = type;
    //console.log('  ', buf);
  }

  /**
   * TODO: description
   * @param dst
   * @param src
   */
  public copyToBuffer<T extends TypedArray>(dst: WasmBuffer, src: T) {
    const type_: WasmMemoryType = dst.type;
    this.resizeBuffer(dst, src.length, type_);
    const dst_ = this.wasm!.memoryManager.mem[type_];
    dst_.set(src, dst.ptr[0] / src.BYTES_PER_ELEMENT);
  }

  /**
   * TODO: description
   * @param dst
   * @param src
   */
  public copyFromBuffer<T extends TypedArray>(dst: T, src: WasmBuffer): T {
    const length = src.ptr.length;
    dst = this.resize(dst, length);
    const src_ = new (dst.constructor as TypedArrayConstructor<T>)(
      this.wasm!.memory,
      src.ptr[0],
      length
    );
    dst.set(src_);
    return dst;
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
  public mean<T extends TypedArray>(data: T): number {
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
  public rms(data: Float32Array): number {
    const wasm = this.wasm;
    if (!wasm) {
      return 0;
    }
    this.copyToBuffer(this.inputBuffer, data);
    return wasm.exports.rms(this.inputBuffer.ptr[0], data.length);
  }

  /**
   * TODO: description
   */
  public autocorr(
    tdata: Float32Array,
    minOffset: number,
    maxOffset: number,
    output: Float32Array
  ): Float32Array {
    const wasm = this.wasm;
    if (!wasm) {
      return output;
    }
    this.copyToBuffer(this.inputBuffer, tdata);
    this.resizeBuffer(this.outputBuffer, tdata.length);
    wasm.exports.autocorr(
      this.inputBuffer.ptr[0],
      this.outputBuffer.ptr[0],
      tdata.length,
      minOffset,
      maxOffset
    );
    return this.copyFromBuffer(output, this.outputBuffer);
  }

  /**
   * TODO: description
   */
  public autocorrpeak(
    acdata: Float32Array,
    minOffset: number,
    maxOffset: number
  ): number {
    const wasm = this.wasm;
    if (!wasm) {
      return NaN;
    }
    this.copyToBuffer(this.inputBuffer, acdata);
    const ret = wasm.exports.autocorrpeak(
      this.inputBuffer.ptr[0],
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
    fft: Float32Array,
    output: Float32Array,
    start: number,
    end: number,
    radius: number,
    fftMin: number,
    fftMax: number,
    normalize = false
  ): Float32Array {
    const wasm = this.wasm;
    if (!wasm) {
      return output;
    }
    this.copyToBuffer(this.inputBuffer, fft);
    this.resizeBuffer(this.outputBuffer, fft.length);
    wasm.exports.prominence(
      this.inputBuffer.ptr[0],
      this.outputBuffer.ptr[0],
      fft.length,
      start,
      end,
      radius,
      fftMin,
      fftMax,
      normalize
    );
    return this.copyFromBuffer(output, this.outputBuffer);
  }

  /**
   * TODO: description
   */
  public prominencepeak(
    prominence: Float32Array,
    peakType: FftPeakType = FftPeakType.MIN_FREQUENCY,
    start = 0,
    end: number = prominence.length,
    threshold = 10
  ): number {
    const wasm = this.wasm;
    if (!wasm) {
      return NaN;
    }
    this.copyToBuffer(this.inputBuffer, prominence);
    const ret = wasm.exports.prominencepeak(
      this.inputBuffer.ptr[0],
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
  public cepstrum(fft: Float32Array, output: Float32Array): Float32Array {
    if (fft.length < 2) {
      return output;
    }
    const wasm = this.wasm;
    if (!wasm) {
      return output;
    }
    this.copyToBuffer(this.inputBuffer, fft);
    this.resizeBuffer(this.outputBuffer, 1 + fft.length / 2);
    wasm.exports.cepstrum(
      this.inputBuffer.ptr[0],
      this.outputBuffer.ptr[0],
      fft.length * 2
    );
    return this.copyFromBuffer(output, this.outputBuffer);
  }

  /**
   * TODO: description
   */
  public fftpeaks(
    fft: Float32Array,
    output: Peaks,
    mask: FftPeakMask,
    maskRadius: number
  ): Peaks {
    const wasm = this.wasm;
    if (!wasm) {
      return output;
    }
    this.copyToBuffer(this.inputBuffer, fft);
    this.resizeBuffer(this.outputBuffer, fft.length);
    console.log(wasm.exports);
    output.count = wasm.exports.fftpeaks(
      this.inputBuffer.ptr[0],
      this.outputBuffer.ptr[0],
      fft.length,
      mask,
      maskRadius
    );
    output.data = this.copyFromBuffer(output.data, this.outputBuffer);
    return output;
  }

  /**
   * TODO: description
   */
  public mpd(
    fftpeaks: Float32Array,
    fftPeakCount: number,
    output: PeakDistance
  ): PeakDistance {
    const wasm = this.wasm;
    if (!wasm) {
      return output;
    }
    this.copyToBuffer(this.inputBuffer, fftpeaks);
    this.resizeBuffer(this.outputBuffer, fftpeaks.length);
    output.median = wasm.exports.mpd(
      this.inputBuffer.ptr[0],
      this.outputBuffer.ptr[0],
      fftpeaks.length,
      fftPeakCount
    );
    output.histogram = this.copyFromBuffer(output.histogram, this.outputBuffer);
    if (output.median < 0) {
      output.median = NaN;
    }
    return output;
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

export const AudioMath: AudioMathInstance = new AudioMathInstance();
