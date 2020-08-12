import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { FftPeakType } from '../../interfaces';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { UntilDestroy } from '../../utils/angular.util';
import { stateFormControl } from '../../utils/ngxs.util';

@Component({
  selector: 'app-pitch-options',
  templateUrl: './pitch-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PitchOptionsComponent extends UntilDestroy {
  public readonly pitch = this.graph.listPitchDetection();

  public readonly peakTypes = [
    { id: FftPeakType.MIN_FREQUENCY, name: 'Min Frequency' },
    { id: FftPeakType.MAX_MAGNITUDE, name: 'Max Magnitude' },
    { id: FftPeakType.MAX_PROMINENCE, name: 'Max Prominence' },
  ];

  public readonly form = new FormGroup({
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
    peakType: stateFormControl(
      null,
      this.graph.select(AudioGraphState.fftPeakType),
      (t: FftPeakType) => this.graph.dispatch('setFftPeakType', t),
      this.destroyed$,
      environment.throttle
    ),
    prominenceRadius: stateFormControl(
      null,
      this.graph.select(AudioGraphState.fftPeakProminenceRadius),
      (x: number) => this.graph.dispatch('setFftPeakProminenceRadius', x),
      this.destroyed$,
      environment.throttle
    ),
    prominenceThreshold: stateFormControl(
      null,
      this.graph.select(AudioGraphState.fftPeakProminenceThreshold),
      (x: number) => this.graph.dispatch('setFftPeakProminenceThreshold', x),
      this.destroyed$,
      environment.throttle
    ),
  });

  /**
   * Constructor.
   * @param graph
   */
  constructor(private readonly graph: AudioGraphService) {
    super();
  }
}
