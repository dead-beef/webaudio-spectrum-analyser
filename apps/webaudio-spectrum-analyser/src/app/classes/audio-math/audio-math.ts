import {
  AudioMathWasmFunctions,
  Autocorrelation,
  FftPeakType,
  Prominence,
  WasmBuffer,
} from '../../interfaces';
import * as wasmModule from '../../wasm/math.c';

class AudioMathInstance {
  private _wasm: Nullable<WasmModule<AudioMathWasmFunctions>> = null;

  public wasmError: Nullable<Error> = null;

  public inputBuffer: WasmBuffer = {
    ptr: [],
    type: 1,
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
    if (typeof init !== 'undefined') {
      init((imports: WasmImports) => {
        //console.warn('imports', imports);
        imports['emscripten_resize_heap'] = (...args) => {
          console.warn('emscripten_resize_heap', args);
        };
        imports['segfault'] = () => {
          throw new Error('segfault');
        };
        imports['alignfault'] = () => {
          throw new Error('alignfault');
        };
        return imports;
      })
        .then((wasm_: WasmModule<AudioMathWasmFunctions>) => {
          window['wasm'] = wasm_;
          this.wasm = wasm_;
        })
        .catch((err: Error) => {
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
  public interpolatePeak(peak: number, left: number, right: number): number {
    const c = peak;
    const b = (right - left) / 2;
    const a = left + b - c;
    if (Math.abs(a) < 1e-3) {
      return 0;
    }
    return -b / (2 * a);
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
    type: WasmMemoryType = 1
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
    const type_: WasmMemoryType = src.BYTES_PER_ELEMENT as any;
    this.resizeBuffer(dst, src.length, type_);
    const dst_ = this.wasm!.memoryManager.mem[type_];
    dst_.set(src, dst.ptr[0]);
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
  public resize<T extends TypedArray>(arr: T, size: number): T {
    if (arr.length !== size) {
      arr = new (arr.constructor as TypedArrayConstructor<T>)(size);
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
    start: number = 0,
    end: number = data.length
  ): number {
    if (!data.length) {
      return -1;
    }

    start = this.clamp(start, 0, data.length);
    end = this.clamp(end, 0, data.length);

    let res = -1;
    let max = -Infinity;
    for (let i = start; i < end; i += 1) {
      if (max < data[i]) {
        res = i;
        max = data[i];
      }
    }
    return res;
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
   * @param start
   * @param end
   */
  public autocorrelation(
    data: Uint8Array,
    minOffset: number,
    maxOffset: number,
    output: Float32Array
  ): Autocorrelation {
    output = this.resize(output, data.length);

    const wasm = this.wasm;
    if (!wasm) {
      return {
        value: output,
        peak: -1,
      };
    }

    this.copyToBuffer(this.inputBuffer, data);
    this.resizeBuffer(this.outputBuffer, data.length, this.outputBuffer.type);

    const res: number = wasm.exports.autocorrpeak(
      this.inputBuffer.ptr[0],
      this.outputBuffer.ptr[0],
      data.length,
      minOffset,
      maxOffset
    );

    output = this.copyFromBuffer(output, this.outputBuffer);

    return {
      value: output,
      peak: res,
    };
  }

  /**
   * TODO: description
   */
  public prominence(
    fft: Uint8Array,
    output: Uint8Array,
    peakType: FftPeakType = FftPeakType.MAX_MAGNITUDE,
    start: number = 0,
    end: number = fft.length - 1,
    radius: number = 0,
    threshold: number = 0.1
  ): Prominence {
    output = this.resize(output, fft.length);

    const wasm = this.wasm;
    if (!wasm) {
      return {
        value: output,
        peak: -1,
      };
    }

    this.copyToBuffer(this.inputBuffer, fft);
    this.resizeBuffer(this.outputBuffer, fft.length, this.outputBuffer.type);

    const res: number = wasm.exports.prominencepeak(
      this.inputBuffer.ptr[0],
      this.outputBuffer.ptr[0],
      fft.length,
      start,
      end,
      radius,
      threshold,
      peakType
    );

    output = this.copyFromBuffer(output, this.outputBuffer);

    return {
      value: output,
      peak: res,
    };
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
    phase: number = 0,
    reverse: boolean = false
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
    phase: number = 0
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
    phase: number = 0
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
