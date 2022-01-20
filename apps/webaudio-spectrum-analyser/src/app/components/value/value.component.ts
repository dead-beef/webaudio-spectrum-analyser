import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { UnitType as U } from '../../interfaces';

@Component({
  selector: 'app-value',
  templateUrl: './value.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueComponent {
  public readonly units = U;

  @Input() public unit: U = U.NUMBER;

  @Input() public value: Nullable<number> = null;

  constructor() {}
}
