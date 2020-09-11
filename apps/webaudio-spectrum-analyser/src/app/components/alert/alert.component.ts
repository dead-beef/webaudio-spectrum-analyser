import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  @Input() public error: Nullable<AnyError> = null;

  @Output() public readonly errorChange = new EventEmitter<
    Nullable<AnyError>
  >();

  /**
   * Dismisses alert.
   */
  public clearError() {
    this.errorChange.emit(null);
  }
}
