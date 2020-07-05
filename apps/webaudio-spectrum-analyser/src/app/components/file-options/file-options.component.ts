import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioControlsComponent } from '../audio-controls/audio-controls.component';
import { AudioGraphSourceNode } from '../../interfaces';

@Component({
  selector: 'app-file-options',
  templateUrl: './file-options.component.html',
})
export class FileOptionsComponent implements AfterViewInit, OnDestroy {
  @ViewChild(AudioControlsComponent)
  public audioControls: AudioControlsComponent;

  public readonly graph: AudioGraph = this.graphService.graph;

  public loading = true;

  public error: Error = null;

  public url = '';

  public filename = 'None';

  /**
   * Constructor.
   * @param graphService
   */
  constructor(private readonly graphService: AudioGraphService) {}

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
    void this.graphService.setSource({
      node: AudioGraphSourceNode.FILE,
      data: this.audioControls.audio
    });
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    this.setFile('');
  }

  /**
   * Sets file.
   * @param url
   * @param name
   */
  public setFile(url: string, name: string = null) {
    if (this.url) {
      URL.revokeObjectURL(this.url);
    }
    let filename = name;
    if (name === null || typeof name === 'undefined') {
      filename = url ? '<no name>' : 'None';
    }
    this.url = url;
    this.filename = filename;
    this.error = null;
  }

  /**
   * Sets error
   * @param error
   */
  public setError(error: Error) {
    this.setFile('');
    this.error = error;
  }
}
