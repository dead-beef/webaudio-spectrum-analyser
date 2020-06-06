import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-wave-options',
  templateUrl: './wave-options.component.html',
})
export class WaveOptionsComponent implements OnInit, OnDestroy {
  @Input() public node: OscillatorNode;

  @Output() public readonly create = new EventEmitter<void>();

  @Output() public readonly destroy = new EventEmitter<void>();

  /**
   * Lifecycle hook.
   */
  public ngOnInit() {
    this.create.emit();
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    this.destroy.emit();
  }
}
