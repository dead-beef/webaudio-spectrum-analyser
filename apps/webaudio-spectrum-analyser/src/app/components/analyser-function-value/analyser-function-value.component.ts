import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { AnalyserFunctionDomain as FD } from '../../interfaces';

@Component({
  selector: 'app-analyser-function-value',
  templateUrl: './analyser-function-value.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyserFunctionValueComponent {
  public readonly domains = FD;

  @Input() public domain: FD = FD.TIME;

  @Input() public value: Nullable<number> = null;

  constructor() {}
}
