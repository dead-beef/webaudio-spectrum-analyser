import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  @Input() public error: Error;

  @Output() public readonly errorChange = new EventEmitter<Error>();

  /**
   * Dismisses alert.
   */
  public clearError() {
    this.errorChange.emit(null);
  }
}
