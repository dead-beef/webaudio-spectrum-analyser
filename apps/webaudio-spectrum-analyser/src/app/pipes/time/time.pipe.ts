import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  /**
   * TODO: description
   * @param x
   */
  private format(x: number): string {
    if (x < 10) {
      return '0' + x.toString();
    }
    return x.toString();
  }

  /**
   * TODO: description
   * @param value
   */
  public transform(value: any): string {
    let s: number = Math.floor(Number(value) || 0);
    let sign = '';
    if (s < 0) {
      s = -s;
      sign = '-';
    }
    const m: number = Math.floor(s / 60) % 60;
    const h: number = Math.floor(s / 3600);
    s %= 60;
    const parts: number[] = [m, s];
    if (h) {
      parts.unshift(h);
    }
    return sign + parts.map(x => this.format(x)).join(':');
  }
}
