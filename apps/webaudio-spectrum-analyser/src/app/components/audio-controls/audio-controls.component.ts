import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-audio-controls',
  templateUrl: './audio-controls.component.html',
})
export class AudioControlsComponent implements AfterViewInit {
  @Input() public src: string;

  @ViewChild('audio') public audio: ElementRef;

  public error: MediaError = null;

  public paused = true;

  public duration = 0;

  private timeValue = 0;

  private nativeElement: HTMLAudioElement;

  /**
   * Time getter.
   */
  public get time(): number {
    return this.timeValue;
  }

  /**
   * Time setter.
   */
  public set time(time: number) {
    this.nativeElement.currentTime = time;
    this.timeValue = time;
  }

  /**
   * Loaded data handler.
   */
  public loadedData() {
    //console.log('loaded data', this.audio.nativeElement);
    this.error = this.nativeElement.error;
    this.paused = true;
    this.time = 0;
    this.duration = this.nativeElement.duration;
    this.nativeElement.pause();
  }

  /**
   * Time update handler.
   */
  public timeUpdate() {
    this.timeValue = this.nativeElement.currentTime;
  }

  /**
   * Play/ause toggler.
   */
  public toggle() {
    if (this.paused) {
      if (this.nativeElement.ended) {
        this.time = 0;
      }
      void this.nativeElement.play();
    } else {
      this.nativeElement.pause();
    }
  }

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
    this.nativeElement = this.audio.nativeElement;
  }
}
