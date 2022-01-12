import { Pipe, PipeTransform } from '@angular/core';

import { AnalyserFunctionDomain as FD } from '../../classes/analyser/interfaces';
import { FrequencyUnitsPipe } from '../frequency-units/frequency-units.pipe';
import { UnitsPipe } from '../units/units.pipe';

@Pipe({
  name: 'units2',
  pure: false,
})
export class Units2Pipe implements PipeTransform {
  private lastValue: Nullable<number> = null;

  private lastDomain: FD = FD.OTHER;

  private lastResult = 'N/A';

  constructor(
    private readonly unitsPipe: UnitsPipe,
    private readonly frequencyUnitsPipe: FrequencyUnitsPipe
  ) {}

  public transform(value: Nullable<number>, domain: FD): string {
    if (domain === FD.FREQUENCY) {
      return this.frequencyUnitsPipe.transform(value);
    }
    if (domain === this.lastDomain && value === this.lastValue) {
      return this.lastResult;
    }
    const res = this.unitsPipe.transform(value, '', false, 2);
    this.lastValue = value;
    this.lastDomain = domain;
    this.lastResult = res;
    return res;
  }
}
