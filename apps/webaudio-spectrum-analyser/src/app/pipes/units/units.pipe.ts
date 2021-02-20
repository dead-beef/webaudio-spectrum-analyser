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
    { value: 1e-6, prefix: 'u' },
  ];

  /**
   * TODO: description
   */
  private getUnit(value: number): Nullable<Unit> {
    for (const unit of this.units) {
      if (value >= unit.value) {
        return unit;
      }
    }
    const minUnit = this.units[this.units.length - 1];
    if (value < minUnit.value / 10) {
      return null;
    }
    return minUnit;
  }

  /**
   * TODO: description
   * @param value
   */
  public transform(
    value: Nullable<number>,
    unitName: string = '',
    usePrefix: boolean = true
  ): string {
    if (value === null || isNaN(value)) {
      return 'N/A';
    }
    let prefix = '';
    if (usePrefix) {
      const unit = this.getUnit(value);
      if (unit !== null) {
        value /= unit.value;
        prefix = unit.prefix;
      }
    }
    return value.toFixed(1).concat(prefix, unitName);
  }
}
