import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { AudioControlsComponent } from '../audio-controls/audio-controls.component';

@Component({
  selector: 'app-file-options',
  templateUrl: './file-options.component.html',
})
export class FileOptionsComponent implements AfterViewInit, OnDestroy {
  @Input() public graph: AudioGraph;

  @Output() public readonly create = new EventEmitter<ElementRef>();

  @Output() public readonly destroy = new EventEmitter<void>();

  @ViewChild(AudioControlsComponent)
  public audioControls: AudioControlsComponent;

  public loading = true;

  public error: Error = null;

  public url = '';

  public filename = 'None';

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
    this.create.emit(this.audioControls.audio);
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    this.setFile('');
    this.destroy.emit();
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
