import { Component, OnInit } from '@angular/core';

import { AudioGraphSourceNode } from '../../interfaces';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';

@Component({
  selector: 'app-wave-options',
  templateUrl: './wave-options.component.html',
})
export class WaveOptionsComponent implements OnInit {
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
    void this.graphService.setSourceNode(AudioGraphSourceNode.WAVE);
  }
}
