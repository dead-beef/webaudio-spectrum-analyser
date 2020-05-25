import { Component, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'audio-controls',
  templateUrl: './audio-controls.component.html'
})
export class AudioControlsComponent {

  @Input() src: URL;
  @ViewChild('audio') audio: ElementRef;

  public error: MediaError = null;
  public paused = true;
  public duration = 0;

  private _time = 0;
  get time(): number {
    return this._time;
  }
  set time(time: number) {
    this.audio.nativeElement.currentTime = time;
    this._time = time;
  }

  constructor() {}

  loadedData() {
    //console.log('loaded data', this.audio.nativeElement);
    this.error = this.audio.nativeElement.error;
    this.paused = true;
    this.time = 0;
    this.duration = this.audio.nativeElement.duration;
    this.audio.nativeElement.pause();
  }

  timeUpdate() {
    this._time = this.audio.nativeElement.currentTime;
  }

  toggle() {
    if(this.paused) {
      if(this.audio.nativeElement.ended) {
        this.time = 0;
      }
      this.audio.nativeElement.play();
    }
    else {
      this.audio.nativeElement.pause();
    }
  }

}
