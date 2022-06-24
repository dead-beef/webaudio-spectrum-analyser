import { EventEmitter } from '@angular/core';

export class ErrorHandler {
  public readonly error = new EventEmitter<any>();

  /**
   * TODO: description
   */
  public handleError(error: any): void {
    console.error(error);
    this.error.emit(error);
  }
}
