import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';

import { AudioGraphSourceNode } from '../../interfaces';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { AudioControlsComponent } from '../audio-controls/audio-controls.component';

@Component({
  selector: 'app-file-options',
  templateUrl: './file-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileOptionsComponent implements AfterViewInit, OnDestroy {
  @ViewChild(AudioControlsComponent)
  public audioControls: AudioControlsComponent;

  public paused$: Observable<boolean> = this.graph.select(
    AudioGraphState.paused
  );

  public loading = true;

  public error: Error = null;

  public url = '';

  public filename = 'None';

  /**
   * Constructor.
   * @param graph
   */
  constructor(private readonly graph: AudioGraphService) {}

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
    void this.graph.dispatch('setSource', {
      node: AudioGraphSourceNode.FILE,
      data: this.audioControls.audio.nativeElement,
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

  /**
   * TODO: description
   */
  public setPaused(paused: boolean) {
    if (paused) {
      void this.graph.dispatch('pause');
    } else {
      void this.graph.dispatch('play');
    }
  }
}
