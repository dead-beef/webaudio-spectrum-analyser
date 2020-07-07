import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';

import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { FrequencyChartComponent } from '../frequency-chart/frequency-chart.component';

@Component({
  selector: 'app-audio-graph',
  templateUrl: './audio-graph.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioGraphComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(FrequencyChartComponent) public chart: FrequencyChartComponent;

  @ViewChild('audio') public audioRef: ElementRef<HTMLAudioElement>;

  @Select(AudioGraphState.getPaused) public paused$: Observable<boolean>;

  public audio: HTMLAudioElement;

  public error: Error = null;

  private volumeValue: number;

  private logVolumeValue: number;

  /**
   * Constructor.
   * @param graph
   */
  constructor(private readonly graph: AudioGraphService) {}

  /**
   * Volume getter.
   */
  public get volume(): number {
    return this.logVolumeValue;
  }

  /**
   * Volume setter.
   */
  public set volume(logVolume: number) {
    const base = 2.0;
    const volume: number = Math.pow(base, logVolume) - 1.0;
    this.volumeValue = volume;
    this.logVolumeValue = logVolume;
    if (this.audio) {
      this.audio.volume = this.volumeValue;
    }
  }

  /**
   * Lifecycle hook.
   */
  public ngOnInit() {
    try {
      this.volume = 0.25;
    } catch (err) {
      console.error(err);
      this.error = err;
    }
  }

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
    try {
      this.audio = this.audioRef.nativeElement;
      this.audio.srcObject = this.graph.getOutputStream();
      this.audio.volume = this.volume;
    } catch (err) {
      console.error(err);
      this.error = err;
    }
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    this.audio = null;
  }

  /**
   * Toggles playback.
   */
  public toggle() {
    void this.graph
      .toggle()
      .pipe(withLatestFrom(this.paused$))
      .subscribe(([_, paused]) => {
        if (paused) {
          this.audio.pause();
        } else {
          void this.audio.play();
        }
      });
  }

  /**
   * Resets chart.
   */
  public reset() {
    void this.graph.reset().subscribe();
  }
}
