/* eslint-disable compat/compat */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { stateFormControl } from '../../utils/ngxs.util';
import { environment } from '../../../environments/environment';

@UntilDestroy()
@Component({
  selector: 'app-common-options',
  templateUrl: './common-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonOptionsComponent {
  public delay$ = this.graph.select(AudioGraphState.delay);

  private readonly destroyed$ = untilDestroyed(this);

  public readonly fftSizes: number[] = this.graph.getFftSizes();

  public readonly maxDelay: number = this.graph.getMaxDelay();

  public readonly pitch = this.graph.listPitchDetection();

  public readonly graphForm = new FormGroup({
    delay: stateFormControl(
      null,
      this.delay$,
      (d: number) => this.graph.dispatch('setDelay', d),
      this.destroyed$,
      environment.throttle
    ),
    fftSize: stateFormControl(
      null,
      this.graph.select(AudioGraphState.fftSize),
      (s: number) => this.graph.dispatch('setFftSize', s),
      this.destroyed$
    ),
  });

  public readonly pitchForm = new FormGroup({
    enabled: new FormGroup(
      Object.fromEntries(
        this.pitch.map(pd => [
          pd.short,
          stateFormControl(
            null,
            this.graph.select(AudioGraphState.pitchEnabled(pd.short)),
            (e: boolean) =>
              this.graph.dispatch('setPitchDetection', {
                id: pd.short,
                enabled: e,
              }),
            this.destroyed$
          ),
        ])
      )
    ),
    debug: stateFormControl(
      null,
      this.graph.select(AudioGraphState.debug),
      (d: boolean) => this.graph.dispatch('setDebug', d),
      this.destroyed$
    ),
    minPitch: stateFormControl(
      null,
      this.graph.select(AudioGraphState.minPitch),
      (p: number) => this.graph.dispatch('setMinPitch', p),
      this.destroyed$,
      environment.throttle
    ),
    maxPitch: stateFormControl(
      null,
      this.graph.select(AudioGraphState.maxPitch),
      (p: number) => this.graph.dispatch('setMaxPitch', p),
      this.destroyed$,
      environment.throttle
    ),
  });

  /**
   * Constructor.
   * @param graph
   */
  constructor(private readonly graph: AudioGraphService) {}
}
