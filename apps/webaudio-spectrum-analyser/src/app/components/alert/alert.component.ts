import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'alert',
  templateUrl: './alert.component.html'
})
export class AlertComponent {

  @Input() error: Error;
  @Output() errorChange = new EventEmitter<Error>();

  constructor() {}

  clearError() {
    this.errorChange.emit(null);
  }

}
