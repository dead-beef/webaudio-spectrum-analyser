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
