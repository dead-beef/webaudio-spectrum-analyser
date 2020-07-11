import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-frequency',
  templateUrl: './input-frequency.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFrequencyComponent),
      multi: true,
    },
  ],
})
export class InputFrequencyComponent
  implements ControlValueAccessor, OnChanges {
  @Input() public name: string;

  @Input() public min = 20;

  @Input() public max = 20000;

  public log = 0;

  public logMin = Math.log2(this.min);

  public logMax = Math.log2(this.max);

  public logName = '';

  public _value = 0;

  /**
   * Value getter.
   */
  public get value(): number {
    return this._value;
  }

  /**
   * Value setter.
   */
  public set value(v: number) {
    this._value = v;
    this.onChange(this._value);
  }

  private onChange = (_: any) => {};

  /**
   * Lifecycle hook.
   * @param changes
   */
  public ngOnChanges(changes: SimpleChanges): void {
    //console.log(changes);
    if (changes.min) {
      this.logMin = Math.log2(changes.min.currentValue);
    }
    if (changes.max) {
      this.logMax = Math.log2(changes.max.currentValue);
    }
    if (changes.name) {
      this.logName = `log${changes.name.currentValue}`;
    }
  }

  /**
   * ControlValueAccessor
   * @param value
   */
  public writeValue(value: any): void {
    this.setValue(Number(value));
  }

  /**
   * ControlValueAccessor
   * @param fn
   */
  public registerOnChange(fn): void {
    this.onChange = fn;
  }

  /**
   * ControlValueAccessor
   */
  public registerOnTouched(): void {}

  /**
   * Sets log value.
   * @param lv
   */
  public setLogValue(lv: number): void {
    this.log = lv;
    this.value = Math.round(Math.pow(2, lv));
  }

  /**
   * Sets value.
   * @param v
   */
  public setValue(v: number): void {
    this.log = Math.log2(v);
    this.value = v;
  }
}
