import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { InputRangeComponent } from '../input-range/input-range.component';

@Component({
  selector: 'app-input-frequency',
  templateUrl: '../input-range/input-range.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFrequencyComponent),
      multi: true,
    },
  ],
})
export class InputFrequencyComponent extends InputRangeComponent {
  /**
   * Constructor.
   */
  constructor() {
    super();
    this.min = 20;
    this.max = 20000;
    this.step = 1;
    this.log = true;
    this.rangeMin = Math.log(this.min);
    this.rangeMax = Math.log(this.max);
  }
}
