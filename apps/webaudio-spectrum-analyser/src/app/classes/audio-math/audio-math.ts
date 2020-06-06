import { TypedArray, TypedArrayConstructor } from '../../interfaces';

export class AudioMath {
  /**
   * TODO: description
   * @param x
   * @param min
   * @param max
   */
  public static clamp(x: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, x));
  }

  /**
   * TODO: description
   * @param factor
   * @param prev
   * @param cur
   */
  public static smooth(factor: number, prev: number, cur: number): number {
    return factor * prev + (1 - factor) * cur;
  }

  /**
   * TODO: description
   * @param peak
   * @param left
   * @param right
   */
  public static interpolatePeak(peak: number, left: number, right: number): number {
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
   * @param arr
   * @param size
   */
  public static resize<T extends TypedArray>(arr: T, size: number): T {
    if (arr.length !== size) {
      arr = new (arr.constructor as TypedArrayConstructor<T>)(size);
    }
    return arr;
  }

  /**
   * TODO: description
   * @param data
   */
  public static mean<T extends TypedArray>(data: T): number {
    if (!data.length) {
      return 0;
    }
    return data.reduce((s, x) => s + x) / data.length;
  }

  /**
   * TODO: description
   * @param data
   * @param mean
   */
  public static variance<T extends TypedArray>(data: T, mean?: number) {
    if (!data.length) {
      return 0;
    }
    let meanValue = mean;
    if (mean === null || typeof mean === 'undefined') {
      meanValue = AudioMath.mean(data);
    }
    return data.reduce((s, x) => s + Math.pow(x - meanValue, 2)) / data.length;
  }

  /**
   * TODO: description
   * @param data
   */
  public static center<T extends TypedArray>(data: T): number {
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
  public static indexOfMax<T extends TypedArray>(data: T, start?: number, end?: number): number {
    if (!data.length) {
      return -1;
    }

    start = AudioMath.clamp(Number(start) || 0, 0, data.length);
    end = AudioMath.clamp(Number(end) || data.length, 0, data.length);

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
  public static indexOfPeak<T extends TypedArray>(data: T, start?: number, end?: number): number {
    if (data.length < 3) {
      return -1;
    }

    start = AudioMath.clamp(Number(start) || 0, 1, data.length);
    end = AudioMath.clamp(Number(end) || data.length - 1, 2, data.length - 1);

    let res = -1;
    let max = -Infinity;

    for (let i = start; i < end; i += 1) {
      if (data[i] >= Math.max(data[i - 1], data[i + 1])) {
        if (max < data[i]) {
          res = i;
          max = data[i];
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
  public static indexOfAutocorrPeak<T extends TypedArray>(
    data: T,
    start?: number,
    end?: number,
  ): number {
    if (data.length < 4) {
      return -1;
    }

    start = AudioMath.clamp(Number(start) || 0, 0, data.length);
    end = AudioMath.clamp(Number(end) || data.length, 0, data.length);

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
  public static zcr<T extends TypedArray>(data: T): number {
    if (!data.length) {
      return 0;
    }
    const mean = AudioMath.mean(data);
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
   * @param var_
   * @param offset
   */
  public static autocorr1<T extends TypedArray>(
    data: T,
    mean: number,
    var_: number,
    offset: number,
  ): number {
    let res = 0;
    for (let i = offset; i < data.length; i += 1) {
      res += (data[i] - mean) * (data[i - offset] - mean);
    }
    res /= data.length - offset;
    return AudioMath.clamp(res / var_, -1, 1);
  }

  /**
   * TODO: description
   * @param data
   * @param minOffset
   * @param maxOffset
   * @param output
   */
  public static autocorr<T extends TypedArray, U extends TypedArray>(
    data: T,
    minOffset: number,
    maxOffset: number,
    output: U,
  ): U {
    maxOffset = AudioMath.clamp(maxOffset, 0, data.length - 1);
    minOffset = AudioMath.clamp(minOffset, 0, maxOffset - 1);

    if (output.length < data.length) {
      output = new (output.constructor as TypedArrayConstructor<U>)(data.length);
    } else {
      output.fill(0);
    }

    const mean = AudioMath.mean(data);
    const var_ = AudioMath.variance(data, mean);

    for (let i = minOffset; i < maxOffset; i += 1) {
      output[i] = AudioMath.autocorr1(data, mean, var_, i);
    }

    return output;
  }
}
