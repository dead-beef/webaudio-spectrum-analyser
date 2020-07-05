import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { FrequencyChartComponent } from '../frequency-chart/frequency-chart.component';

@Component({
  selector: 'app-audio-graph',
  templateUrl: './audio-graph.component.html',
})
export class AudioGraphComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(FrequencyChartComponent) public chart: FrequencyChartComponent;

  @ViewChild('audio') public audioRef: ElementRef<HTMLAudioElement>;

  @Select(AudioGraphState.getPaused) public paused$: Observable<boolean>;

  public graph: AudioGraph = this.graphService.graph;

  public audio: HTMLAudioElement;

  public error: Error = null;

  private volumeValue: number;

  private logVolumeValue: number;

  /**
   * Constructor.
   * @param graphService
   */
  constructor(private readonly graphService: AudioGraphService) {}

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
      this.audio.srcObject = this.graph.stream;
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
    void this.graphService
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
    this.graphService.reset();
  }
}
