import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'error'
})
export class ErrorPipe implements PipeTransform {

  transform(value: any, ...args: any[]): string {
    let res: string = value.toString();
    if(typeof value === 'object') {
      if(value.stack) {
        res += '\n' + value.stack.toString();
      }
    }
    return res;
  }

}
