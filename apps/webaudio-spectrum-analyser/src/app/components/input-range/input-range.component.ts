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
  @Input() public name: string;

  @Input() public min: number;

  @Input() public max: number;

  @Input() public step = 1e-4;

  public _value = 0;

  public rangeName = '';

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
    if (changes.name) {
      this.rangeName = `range${changes.name.currentValue}`;
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
