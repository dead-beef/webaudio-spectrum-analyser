import { Component } from '@angular/core';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';

@Component({
  selector: 'app-common-options',
  templateUrl: './common-options.component.html',
})
export class CommonOptionsComponent {
  public readonly graph: AudioGraph = this.graphService.graph;

  /**
   * Constructor.
   * @param graphService
   */
  constructor(private readonly graphService: AudioGraphService) {}
}
