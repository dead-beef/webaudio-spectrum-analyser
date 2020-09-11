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

  /**
   * TODO: description
   * @param value
   */
  public transform(value: Nullable<number>, name: string = ''): string {
    if (value === null || isNaN(value)) {
      return 'N/A';
    }
    let maxUnit: Nullable<Unit> = null;
    value = Number(value);
    for (const unit of this.units) {
      if (value >= unit.value) {
        if (maxUnit === null || maxUnit.value < unit.value) {
          maxUnit = unit;
        }
      }
    }
    let prefix = '';
    if (maxUnit !== null) {
      value /= maxUnit.value;
      prefix = maxUnit.prefix;
    }
    return value.toFixed(1).concat(prefix, name);
  }
}
