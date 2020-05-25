import { Component, Input } from '@angular/core';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';

@Component({
  selector: 'common-options',
  templateUrl: './common-options.component.html'
})
export class CommonOptionsComponent {

  @Input() graph: AudioGraph;

  constructor() { }
}
