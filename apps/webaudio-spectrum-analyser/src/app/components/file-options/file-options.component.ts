import {
  Component, OnInit, OnDestroy, AfterViewInit,
  Input, Output, EventEmitter, ViewChild, ElementRef
} from '@angular/core';

import { AudioControlsComponent } from '../audio-controls/audio-controls.component';
import { AudioGraph } from '../../classes/audio-graph/audio-graph';

@Component({
  selector: 'file-options',
  templateUrl: './file-options.component.html'
})
export class FileOptionsComponent implements AfterViewInit, OnDestroy {

  @Input() graph: AudioGraph;
  @Output() create = new EventEmitter<ElementRef>();
  @Output() destroy = new EventEmitter<void>();
  @ViewChild(AudioControlsComponent) audioControls: AudioControlsComponent;

  public loading = true;
  public error: Error = null;
  public url = '';
  public filename = 'None';

  constructor() {}

  ngAfterViewInit() {
    this.create.emit(this.audioControls.audio);
  }
  ngOnDestroy() {
    this.setFile('');
    this.destroy.emit();
  }

  setFile(url: string, name: string = null) {
    if(this.url) {
      URL.revokeObjectURL(this.url);
    }
    if(name === null || name === undefined) {
      name = url ? '<no name>' : 'None';
    }
    this.url = url;
    this.filename = name;
    this.error = null;
  }

  setError(error: Error) {
    this.setFile('');
    this.error = error;
  }

}
