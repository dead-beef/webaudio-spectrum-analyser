import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';

import { AudioGraphSourceNode, Layouts } from '../../interfaces';
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
  public audioControls: Nullable<AudioControlsComponent> = null;

  public paused$: Observable<boolean> = this.graph.select(
    AudioGraphState.paused
  );

  public loading = true;

  public error: Nullable<AnyError> = null;

  public url = '';

  public filename = 'None';

  public layout = Layouts.VERTICAL;

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
      data: this.audioControls!.audio!.nativeElement,
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
  public setFile(url: string, name: Nullable<string> = null) {
    if (this.url) {
      URL.revokeObjectURL(this.url);
    }
    let filename: string;
    if (name === null || name === undefined) {
      filename = url ? '<no name>' : 'None';
    } else {
      filename = name;
    }
    this.url = url;
    this.filename = filename;
    this.error = null;
  }

  /**
   * Sets error
   * @param error
   */
  public setError(error: Nullable<AnyError>) {
    this.setFile('');
    this.error = error;
  }

  /**
   * TODO: description
   */
  public setPaused(paused: Nullable<boolean>) {
    if (paused) {
      void this.graph.dispatch('pause');
    } else {
      void this.graph.dispatch('play');
    }
  }
}
