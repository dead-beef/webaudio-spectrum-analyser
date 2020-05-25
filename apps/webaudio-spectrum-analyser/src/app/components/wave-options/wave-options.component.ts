import {
  Component, OnInit, OnDestroy, OnChanges,
  SimpleChanges, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'wave-options',
  templateUrl: './wave-options.component.html'
})
export class WaveOptionsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() node: OscillatorNode;
  @Output() create = new EventEmitter<void>();
  @Output() destroy = new EventEmitter<void>();

  public logFrequency: number;

  constructor() {
    this.logFrequency = 1.301;
  }

  ngOnInit() {
    this.create.emit();
  }
  ngOnDestroy() {
    this.destroy.emit();
  }
  ngOnChanges(changes: SimpleChanges) {
    this.logFrequency = Math.log10(this.node.frequency.value);
  }

  setFrequency(f: number, log: boolean = false) {
    let lf: number;
    if(log) {
      lf = f;
      f = Math.round(Math.pow(10.0, lf));
    }
    else {
      lf = Math.log10(f);
    }
    this.node.frequency.value = f;
    this.logFrequency = lf;
  }

}
