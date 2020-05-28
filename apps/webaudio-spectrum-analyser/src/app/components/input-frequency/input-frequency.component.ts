import {
  Component,
  OnInit, OnChanges, SimpleChanges,
  Input, Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'input-frequency',
  templateUrl: './input-frequency.component.html'
})
export class InputFrequencyComponent implements OnChanges {

  @Input() name: string;
  @Input() min: number;
  @Input() max: number;
  @Input() value: number;
  @Output() valueChange = new EventEmitter<number>();

  public log = 0;
  public logMin = 0;
  public logMax = 0;
  public logName = '';

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    //console.log(changes);
    if(changes.min) {
      this.logMin = Math.log2(changes.min.currentValue);
    }
    if(changes.max) {
      this.logMax = Math.log2(changes.max.currentValue);
    }
    if(changes.value) {
      this.log = Math.log2(changes.value.currentValue);
    }
    if(changes.name) {
      this.logName = 'log' + changes.name.currentValue;
    }
  }

  setLogValue(lv: number): void {
    this.log = lv;
    this.valueChange.emit(Math.round(Math.pow(2, lv)));
  }

  setValue(v: number): void {
    this.log = Math.log2(v);
    this.valueChange.emit(v);
  }

}
