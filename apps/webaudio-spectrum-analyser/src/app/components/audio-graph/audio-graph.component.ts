import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ErrorHandler,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ErrorHandler as CustomErrorHandler } from '../../classes/error-handler/error-handler';
import { AudioGraphSourceNode } from '../../interfaces';
import { AnalyserService } from '../../state/analyser/analyser.service';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { stateFormControl } from '../../utils';

@UntilDestroy()
@Component({
  selector: 'app-audio-graph',
  templateUrl: './audio-graph.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioGraphComponent implements AfterViewInit, OnDestroy {
  @ViewChild('audio') public audioRef: Nullable<ElementRef<HTMLAudioElement>> =
    null;

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

  public readonly error$: Observable<any> = this.errorHandler.error;

  public audio: Nullable<HTMLAudioElement> = null;

  public volume = 0.5;

  /**
   * Constructor.
   * @param graph
   */
  constructor(
    private readonly graph: AudioGraphService,
    private readonly analyser: AnalyserService,
    @Inject(ErrorHandler) private readonly errorHandler: CustomErrorHandler
  ) {}

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
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
    void this.analyser.dispatch('reset');
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
