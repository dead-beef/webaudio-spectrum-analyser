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
  selector: 'app-input-range',
  templateUrl: './input-range.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputRangeComponent),
      multi: true,
    },
  ],
})
export class InputRangeComponent implements ControlValueAccessor, OnChanges {
  @Input() public name = '';

  @Input() public min = 0;

  @Input() public max = 1;

  @Input() public step = 1e-4;

  @Input() public log = false;

  @Input() public showValue = true;

  public _value = 0;

  public rangeName = '';

  public rangeValue = 0;

  public rangeMin = 0;

  public rangeMax = 0;

  public rangeStep = 1e-8;

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
    this.rangeValue = this.valueToRange(v);
    this.onChange(this._value);
  }

  private onChange = (_: any) => {};

  /**
   * TODO: description
   * @param x
   */
  private rangeToValue(x: number) {
    if (this.log) {
      x = Math.exp(x);
      x = Math.round(x / this.step) * this.step;
    }
    x = Number(String(x).replace(/0{4,}\d$/, ''));
    return x;
  }

  /**
   * TODO: description
   * @param x
   */
  private valueToRange(x: number) {
    return this.log ? Math.log(x) : x;
  }

  /**
   * TODO: description
   * @param x
   */
  public setRangeValue(value: number) {
    this.value = this.rangeToValue(value);
    this.rangeValue = value;
  }

  /**
   * Lifecycle hook.
   * @param changes
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.name) {
      this.rangeName = `range${changes.name.currentValue}`;
    }
    if (changes.min || changes.log) {
      this.rangeMin = this.valueToRange(this.min);
    }
    if (changes.max || changes.log) {
      this.rangeMax = this.valueToRange(this.max);
    }
    if (changes.step || changes.log) {
      if (this.log) {
        this.rangeStep = 1e-8;
      } else {
        this.rangeStep = this.step;
      }
    }
    if (changes.log) {
      this.rangeValue = this.valueToRange(this.value);
    }
  }

  /**
   * ControlValueAccessor
   * @param value
   */
  public writeValue(value: any): void {
    this.value = Number(value);
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
}
