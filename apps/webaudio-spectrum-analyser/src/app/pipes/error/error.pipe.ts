import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'error',
})
export class ErrorPipe implements PipeTransform {
  /**
   * TODO: description
   * @param value
   */
  public transform(value: AnyError): string {
    let res = String(value);
    if (Object.prototype.hasOwnProperty.call(value, 'stack')) {
      res += '\n' + String((value as Error).stack);
    }
    return res;
  }
}
