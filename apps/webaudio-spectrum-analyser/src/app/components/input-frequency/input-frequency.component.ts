import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-input-frequency',
  templateUrl: './input-frequency.component.html',
})
export class InputFrequencyComponent implements OnChanges {
  @Input() public name: string;

  @Input() public min: number;

  @Input() public max: number;

  @Input() public value: number;

  @Output() public readonly valueChange = new EventEmitter<number>();

  public log = 0;

  public logMin = 0;

  public logMax = 0;

  public logName = '';

  /**
   * Lifecycle hook.
   * @param changes
   */
  public ngOnChanges(changes: SimpleChanges): void {
    //console.log(changes);
    if (Boolean(changes.min)) {
      this.logMin = Math.log2(changes.min.currentValue);
    }
    if (Boolean(changes.max)) {
      this.logMax = Math.log2(changes.max.currentValue);
    }
    if (Boolean(changes.value)) {
      this.log = Math.log2(changes.value.currentValue);
    }
    if (Boolean(changes.name)) {
      this.logName = `log${changes.name.currentValue}`;
    }
  }

  /**
   * Sets log value.
   * @param lv
   */
  public setLogValue(lv: number): void {
    this.log = lv;
    const base = 2;
    this.valueChange.emit(Math.round(Math.pow(base, lv)));
  }

  /**
   * Sets value.
   * @param v
   */
  public setValue(v: number): void {
    this.log = Math.log2(v);
    this.valueChange.emit(v);
  }
}
