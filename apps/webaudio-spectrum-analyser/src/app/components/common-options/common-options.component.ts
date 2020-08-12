import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-common-options',
  templateUrl: './common-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonOptionsComponent {
  /**
   * Constructor.
   */
  constructor() {}
}
