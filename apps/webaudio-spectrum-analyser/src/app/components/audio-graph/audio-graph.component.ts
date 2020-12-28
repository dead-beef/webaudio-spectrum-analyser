import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AudioGraphSourceNode } from '../../interfaces';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { stateFormControl } from '../../utils';
import { FrequencyChartComponent } from '../frequency-chart/frequency-chart.component';

@UntilDestroy()
@Component({
  selector: 'app-audio-graph',
  templateUrl: './audio-graph.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioGraphComponent implements AfterViewInit, OnDestroy {
  @ViewChild(FrequencyChartComponent)
  public chart: Nullable<FrequencyChartComponent> = null;

  @ViewChild('audio') public audioRef: Nullable<
    ElementRef<HTMLAudioElement>
  > = null;

  public readonly form = new FormGroup({
    volume: stateFormControl(
      null,
      this.graph.select(AudioGraphState.volume),
      (v: number) => this.graph.dispatch('setVolume', v),
      untilDestroyed(this),
      environment.throttle
    ),
  });

  public readonly volume$: Observable<number> = this.graph.select(
    AudioGraphState.volume
  );

  public readonly paused$: Observable<boolean> = this.graph.select(
    AudioGraphState.paused
  );

  public readonly source$: Observable<AudioGraphSourceNode> = this.graph.select(
    AudioGraphState.sourceNode
  );

  public readonly source = AudioGraphSourceNode;

  public audio: Nullable<HTMLAudioElement> = null;

  public error: Nullable<AnyError> = null;

  public volume = 0.5;

  /**
   * Constructor.
   * @param graph
   */
  constructor(private readonly graph: AudioGraphService) {}

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
    try {
      this.audio = this.audioRef!.nativeElement;
      this.audio.srcObject = this.graph.getOutputStream();
      void this.paused$.pipe(untilDestroyed(this)).subscribe(paused => {
        if (this.audio === null) {
          return;
        }
        if (paused) {
          this.audio.pause();
        } else {
          void this.audio.play();
          this.setVolume(this.volume);
        }
      });
      void this.volume$.pipe(untilDestroyed(this)).subscribe(volume => {
        this.setVolume(volume);
      });
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
    void this.graph.dispatch('toggle');
  }

  /**
   * Resets chart.
   */
  public reset() {
    void this.graph.dispatch('reset');
  }

  /**
   * Volume setter.
   */
  public setVolume(volume: number) {
    this.volume = volume;
    if (this.audio !== null) {
      this.audio.volume = volume;
    }
  }
}
