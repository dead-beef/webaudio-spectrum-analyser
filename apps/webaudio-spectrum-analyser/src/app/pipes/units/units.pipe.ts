import { Pipe, PipeTransform } from '@angular/core';

import { Unit } from '../../interfaces';

@Pipe({
  name: 'units',
})
export class UnitsPipe implements PipeTransform {
  private readonly units: Unit[] = [
    { value: 1e6, prefix: 'M' },
    { value: 1e3, prefix: 'k' },
    { value: 1, prefix: '' },
    { value: 1e-3, prefix: 'm' },
  ];

  transform(value: number, ...args: any[]): string {
    let unit: Unit = null;
    value = Number(value);
    for (const unit_ of this.units) {
      if (value >= unit_.value) {
        if (unit === null || unit.value < unit_.value) {
          unit = unit_;
        }
      }
    }
    let prefix = '';
    if (unit !== null) {
      value /= unit.value;
      prefix = unit.prefix;
    }
    return value.toFixed(1) + prefix;
  }
}
