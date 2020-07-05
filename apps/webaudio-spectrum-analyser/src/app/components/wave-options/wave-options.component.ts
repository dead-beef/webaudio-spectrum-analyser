import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';

@Component({
  selector: 'app-wave-options',
  templateUrl: './wave-options.component.html',
})
export class WaveOptionsComponent implements OnInit, OnDestroy {
  @Output() public readonly create = new EventEmitter<void>();

  @Output() public readonly destroy = new EventEmitter<void>();

  public readonly node = this.graphService.graph.nodes.wave;

  /**
   * Constructor.
   * @param graphService
   */
  constructor(private readonly graphService: AudioGraphService) {}

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
