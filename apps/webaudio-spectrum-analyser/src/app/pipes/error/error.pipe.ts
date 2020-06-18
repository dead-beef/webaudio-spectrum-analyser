import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'error',
})
export class ErrorPipe implements PipeTransform {
  /**
   * TODO: description
   * @param value
   */
  public transform(value: any): string {
    let res = String(value);
    if (typeof value === 'object') {
      if ((value as Error).stack) {
        res += '\n' + String((value as Error).stack);
      }
    }
    return res;
  }
}
