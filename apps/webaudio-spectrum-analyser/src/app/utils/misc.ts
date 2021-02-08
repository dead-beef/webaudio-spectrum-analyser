import { Point } from '../interfaces';

/**
 * TODO: description
 */
export function getEventPoint(
  ev: Event,
  ox: number = 0,
  oy: number = 0
): Point {
  let x: number;
  let y: number;
  if ('touches' in ev) {
    const ev_ = ev as TouchEvent;
    const touch: Touch = ev_.touches[0];
    x = touch.clientX;
    y = touch.clientY;
  } else {
    const ev_ = ev as MouseEvent;
    x = Number(ev_.clientX) || ox;
    y = Number(ev_.clientY) || oy;
  }
  return {
    x: x - ox,
    y: y - oy,
  };
}

/**
 * TODO: description
 */
export function deepCopy(x: any): any {
  if (x === null || typeof x !== 'object') {
    return x;
  }

  if (Array.isArray(x)) {
    return x.map(deepCopy);
  }

  const src: Record<string, any> = x;
  const dst = {};
  for (const key in src) {
    if (Object.prototype.hasOwnProperty.call(src, key)) {
      dst[key] = deepCopy(src[key]);
    }
  }
  return dst;
}

/**
 * TODO: description
 * @param x
 * @param y
 */
export function arrayEqual(x: any[], y: any) {
  if (!Array.isArray(y)) {
    return false;
  }
  return x.length === y.length && x.every((xx, i) => deepEqual(xx, y[i]));
}

/**
 * TODO: description
 * @param x
 * @param y
 */
export function objectEqual(x: Record<string, any>, y: any) {
  if (typeof y !== 'object') {
    return false;
  }
  const y_: Record<string, any> = y;
  for (const k in x) {
    if (
      Object.prototype.hasOwnProperty.call(x, k) &&
      !Object.prototype.hasOwnProperty.call(y_, k)
    ) {
      return false;
    }
  }
  for (const k in y_) {
    if (
      !Object.prototype.hasOwnProperty.call(x, k) ||
      !Object.prototype.hasOwnProperty.call(y_, k) ||
      !deepEqual(x[k], y_[k])
    ) {
      return false;
    }
  }
  return true;
}

/**
 * TODO: description
 * @param x
 * @param y
 */
export function deepEqual(x: any, y: any) {
  if (Array.isArray(x)) {
    return arrayEqual(x, y);
  }
  if (typeof x === 'object') {
    /* eslint-disable no-prototype-builtins */
    /* eslint-enable no-prototype-builtins */
    return objectEqual(x, y);
  }
  return x === y;
}
