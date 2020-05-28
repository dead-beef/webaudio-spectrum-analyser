import {
  Component, OnInit, OnDestroy,
  Input, Output, EventEmitter
} from '@angular/core';

@Component({
  selector: 'wave-options',
  templateUrl: './wave-options.component.html'
})
export class WaveOptionsComponent implements OnInit, OnDestroy {

  @Input() node: OscillatorNode;
  @Output() create = new EventEmitter<void>();
  @Output() destroy = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {
    this.create.emit();
  }
  ngOnDestroy() {
    this.destroy.emit();
  }

}
