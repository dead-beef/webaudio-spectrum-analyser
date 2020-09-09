import {
  AudioMathWasmFunctions,
  FftPeakType,
  TypedArray,
  TypedArrayConstructor,
  WasmBuffer,
} from '../../interfaces';

import * as wasmModule from '../../wasm/math.c';

class AudioMathInstance {
  private _wasm: WasmModule<AudioMathWasmFunctions> = null;

  public wasmError: Error = null;

  public inputBuffer: WasmBuffer = {
    ptr: [],
    type: 1,
    byteLength: 0,
  };

  public outputBuffer: WasmBuffer = {
    ptr: [],
    type: 1,
    byteLength: 0,
  };

  /**
   * Getter.
   */
  public get wasm(): WasmModule<AudioMathWasmFunctions> {
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
  public set wasm(wasm_: WasmModule<AudioMathWasmFunctions>) {
    this._wasm = wasm_;
  }

  /**
   * Constructor.
   */
  constructor() {
    const init: WasmModuleFactory<AudioMathWasmFunctions> = wasmModule.init;
    init((imports: WasmImports) => {
      //console.warn('imports', imports);
      imports['emscripten_resize_heap'] = (...args) => {
        console.warn('emscripten_resize_heap', args);
      };
      imports['segfault'] = (...args) => {
        throw new Error('segfault');
      };
      imports['alignfault'] = (...args) => {
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
    const wasm = this.wasm;
    const byteLength = length * wasm.memoryManager.mem[type].BYTES_PER_ELEMENT;
    if (byteLength === buf.byteLength && buf.type === type) {
      return;
    }
    console.log('realloc', buf);
    console.log('  free', buf.ptr);
    wasm.memoryManager.free(buf.ptr, buf.type);
    console.log('  malloc', length);
    buf.ptr = wasm.memoryManager.malloc(length, type);
    buf.byteLength = byteLength;
    buf.type = type;
    console.log('  ', buf);
  }

  /**
   * TODO: description
   * @param dst
   * @param src
   */
  public copyToBuffer<T extends TypedArray>(dst: WasmBuffer, src: T) {
    const type_: WasmMemoryType = src.BYTES_PER_ELEMENT as any;
    this.resizeBuffer(dst, src.length, type_);
    const dst_ = this.wasm.memoryManager.mem[type_];
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
      this.wasm.memory,
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
   * @param mean
   */
  public variance<T extends TypedArray>(data: T, mean?: number) {
    if (!data.length) {
      return 0;
    }
    let meanValue = mean;
    if (mean === null || typeof mean === 'undefined') {
      meanValue = this.mean(data);
    }
    return (
      data.reduce((s: number, x: number) => s + Math.pow(x - meanValue, 2)) /
      data.length
    );
  }

  /**
   * TODO: description
   * @param data
   */
  public center<T extends TypedArray>(data: T): number {
    let sum = 0;
    let res = 0;
    for (let i = 0; i < data.length; i += 1) {
      sum += data[i];
      res += data[i] * i;
    }
    return res / sum;
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
   * @param start
   * @param end
   */
  public indexOfProminencePeak<T extends TypedArray, U extends TypedArray>(
    fft: T,
    prominence: U,
    type_: FftPeakType = FftPeakType.MAX_MAGNITUDE,
    start: number = 0,
    end: number = fft.length - 1,
    threshold: number = 0.1
  ): number {
    start = this.clamp(start, 0, fft.length);
    end = this.clamp(end, 0, fft.length - 1);

    if (threshold <= 0) {
      threshold = 1e-8;
    }

    if (fft instanceof Uint8Array) {
      threshold *= 255;
    }

    let max = -Infinity;
    let res = -1;

    for (let i = start; i < end; i += 1) {
      if (prominence[i] >= threshold) {
        let value: number;
        switch (type_) {
          case FftPeakType.MAX_PROMINENCE:
            value = prominence[i];
            break;
          case FftPeakType.MAX_MAGNITUDE:
            value = fft[i];
            break;
          case FftPeakType.MIN_FREQUENCY:
            return i;
          default:
            return -1;
        }
        if (value > max) {
          max = value;
          res = i;
        }
      }
    }
    return res;
  }

  /**
   * TODO: description
   * @param data
   * @param start
   * @param end
   */
  public indexOfAutocorrPeak<T extends TypedArray>(
    data: T,
    start: number = 0,
    end: number = data.length
  ): number {
    if (data.length < 4) {
      return -1;
    }

    start = this.clamp(start, 0, data.length);
    end = this.clamp(end, 0, data.length);

    const eps = 0.01;

    let res = -1;
    let max = -Infinity;

    let min = false;

    start += 1;
    end -= 1;

    for (let i = start; i < end; ++i) {
      const c = data[i];
      const p = data[i - 1];
      const n = data[i + 1];
      /*if(c === p && c === n) {
        continue;
      }*/
      if (min) {
        if (c >= p && c >= n) {
          if (max < data[i] - eps) {
            //console.log('max', i, p, c, n);
            res = i;
            max = data[i];
          }
        }
      } else if (c <= p && c <= n && c < 0) {
        //console.log('min', i, p, c, n);
        min = true;
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
   * @param mean
   * @param variance
   * @param offset
   */
  public autocorr1<T extends TypedArray>(
    data: T,
    mean: number,
    variance: number,
    offset: number
  ): number {
    let res = 0;
    for (let i = offset; i < data.length; i += 1) {
      res += (data[i] - mean) * (data[i - offset] - mean);
    }
    res /= data.length - offset;
    return this.clamp(res / variance, -1, 1);
  }

  /**
   * TODO: description
   * @param data
   * @param minOffset
   * @param maxOffset
   * @param output
   */
  public autocorr(
    data: Uint8Array,
    minOffset: number,
    maxOffset: number,
    output: Float32Array
  ): Float32Array {
    const wasm = this.wasm;
    if (!wasm) {
      return output;
    }

    this.copyToBuffer(this.inputBuffer, data);
    this.resizeBuffer(this.outputBuffer, data.length, 40);

    wasm.exports.autocorr(
      this.inputBuffer.ptr[0],
      this.outputBuffer.ptr[0],
      data.length,
      minOffset,
      maxOffset
    );

    return this.copyFromBuffer(output, this.outputBuffer);

    /*output = this.resize(output, data.length);
    output.fill(0);

    const mean = this.mean(data);
    const variance = this.variance(data, mean);

    for (let i = minOffset; i < maxOffset; i += 1) {
      output[i] = this.autocorr1(data, mean, variance, i);
    }

    return output;*/
  }

  /**
   * TODO: description
   * @param data
   * @param output
   * @param start
   * @param end
   * @param radius
   */
  public prominence<T extends TypedArray, U extends TypedArray>(
    data: T,
    output: U,
    start: number = 1,
    end: number = data.length - 1,
    radius: number = data.length
  ): U {
    start = this.clamp(start, 1, data.length - 1);
    end = this.clamp(end, 1, data.length - 1);

    if (radius < 1) {
      radius = data.length;
    }

    if (output.length < data.length) {
      output = new (output.constructor as TypedArrayConstructor<U>)(
        data.length
      );
    } else {
      output.fill(0);
    }

    for (let i = start; i < end; ++i) {
      let left = 0;
      let right = 0;
      if (data[i] >= Math.max(data[i - 1], data[i + 1])) {
        const start_ = Math.max(start - 1, i - radius);
        const end_ = Math.min(end + 1, i + radius);
        for (let j = i - 1; j >= start_ && data[j] <= data[i]; --j) {
          left = Math.max(left, data[i] - data[j]);
        }
        for (let j = i + 1; j < end_ && data[j] <= data[i]; ++j) {
          right = Math.max(right, data[i] - data[j]);
        }
      }
      output[i] = Math.min(left, right);
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
