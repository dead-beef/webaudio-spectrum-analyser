import { TypedArray } from '../../interfaces';
import { TypedArrayConstructor } from '../../interfaces';

export class AudioMath {

  static clamp(x: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, x));
  }

  static smooth(factor: number, prev: number, cur: number): number {
    return factor * prev + (1 - factor) * cur;
  }

  static resize<T extends TypedArray>(arr: T, size: number): T {
    if(arr.length !== size) {
      arr = new (arr.constructor as TypedArrayConstructor<T>)(size);
    }
    return arr;
  }

  static mean<T extends TypedArray>(data: T): number {
    if(!data.length) {
      return 0;
    }
    return data.reduce((s, x) => s + x) / data.length;
  }

  static variance<T extends TypedArray>(data: T, mean?: number) {
    if(!data.length) {
      return 0;
    }
    if(mean === null || mean === undefined) {
      mean = AudioMath.mean(data);
    }
    return data.reduce((s, x) => s + Math.pow(x - mean, 2)) / data.length;
  }

  static center<T extends TypedArray>(data: T): number {
    let sum = 0;
    let res = 0;
    for(let i = 0; i < data.length; ++i) {
      sum += data[i];
      res += data[i] * i;
    }
    return res / sum;
  }

  static indexOfMax<T extends TypedArray>(
    data: T,
    start?: number,
    end?: number
  ): number {
    if(!data.length) {
      return -1;
    }

    start = AudioMath.clamp(+start || 0, 0, data.length);
    end = AudioMath.clamp(+end || data.length, 0, data.length);

    let res = -1;
    let max = -Infinity;
    for(let i = start; i < end; ++i) {
      if(max < data[i]) {
        res = i;
        max = data[i];
      }
    }
    return res;
  }

  static indexOfPeak<T extends TypedArray>(
    data: T,
    start?: number,
    end?: number
  ): number {
    if(data.length < 3) {
      return -1;
    }

    start = AudioMath.clamp(+start || 0, 1, data.length);
    end = AudioMath.clamp(+end || data.length - 1, 2, data.length - 1);

    let res = -1;
    let max = -Infinity;

    for(let i = start; i < end; ++i) {
      if(data[i] >= Math.max(data[i - 1], data[i + 1])) {
        if(max < data[i]) {
          res = i;
          max = data[i];
        }
      }
    }
    return res;
  }

  static indexOfAutocorrPeak<T extends TypedArray>(
    data: T,
    start?: number,
    end?: number
  ): number {
    if(data.length < 4) {
      return -1;
    }

    start = AudioMath.clamp(+start || 0, 0, data.length);
    end = AudioMath.clamp(+end || data.length, 0, data.length);

    const eps = 0.01;

    let res = -1;
    let max = -Infinity;

    let min = false;

    start += 1;
    end -= 1;

    for(let i = start; i < end; ++i) {
      const c = data[i];
      const p = data[i - 1];
      const n = data[i + 1];
      /*if(c === p && c === n) {
        continue;
      }*/
      if(min) {
        if(c >= p && c >= n) {
          if(max < data[i] - eps) {
            //console.log('max', i, p, c, n);
            res = i;
            max = data[i];
          }
        }
      }
      else if(c <= p && c <= n && c < 0) {
        //console.log('min', i, p, c, n);
        min = true;
      }
    }
    return res;
  }

  static zcr<T extends TypedArray>(data: T): number {
    if(!data.length) {
      return 0;
    }
    const mean = AudioMath.mean(data);
    let res = 0;
    let prevSign = data[0] > mean;
    for(let i = 1; i < data.length; ++i) {
      const sign = data[i] > mean;
      res += +(sign !== prevSign);
      prevSign = sign
    }
    return res / (2 * data.length);
  }

  static autocorr1<T extends TypedArray>(
    data: T,
    mean: number,
    var_: number,
    offset: number
  ): number {
    let res = 0;
    for(let i = offset; i < data.length; ++i) {
      res += (data[i] - mean) * (data[i - offset] - mean);
    }
    res /= data.length - offset;
    return AudioMath.clamp(res / var_, -1, 1);
  }

  static autocorr<T extends TypedArray, U extends TypedArray>(
    data: T,
    minOffset: number,
    maxOffset: number,
    output: U
  ): U {

    maxOffset = AudioMath.clamp(maxOffset, 0, data.length - 1);
    minOffset = AudioMath.clamp(minOffset, 0, maxOffset - 1);

    if(output.length < data.length) {
      output = new (output.constructor as TypedArrayConstructor<U>)(data.length);
    }
    else {
      output.fill(0);
    }

    const mean = AudioMath.mean(data);
    const var_ = AudioMath.variance(data, mean);

    for(let i = minOffset; i < maxOffset; ++i) {
      output[i] = AudioMath.autocorr1(data, mean, var_, i);
    }

    return output;
  }

}
