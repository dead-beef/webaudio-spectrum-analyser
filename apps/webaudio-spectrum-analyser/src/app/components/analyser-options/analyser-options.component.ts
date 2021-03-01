import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { environment } from '../../../environments/environment';
import { FftPeakType, Layouts } from '../../interfaces';
import { AnalyserService } from '../../state/analyser/analyser.service';
import { AnalyserState } from '../../state/analyser/analyser.store';
import { stateFormControl } from '../../utils';

@UntilDestroy()
@Component({
  selector: 'app-analyser-options',
  templateUrl: './analyser-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyserOptionsComponent {
  public layout = Layouts.VERTICAL;

  public readonly functions = this.analyser.analyser.functions;

  public readonly peakTypes = [
    { id: FftPeakType.MIN_FREQUENCY, name: 'Min frequency' },
    { id: FftPeakType.MAX_MAGNITUDE, name: 'Max magnitude' },
    { id: FftPeakType.MAX_PROMINENCE, name: 'Max prominence' },
  ];

  public readonly form = new FormGroup({
    enabled: new FormGroup(
      Object.fromEntries(
        this.functions.map(fn => [
          fn.id,
          stateFormControl(
            null,
            this.analyser.select(AnalyserState.functionEnabled(fn.id)),
            (e: boolean) =>
              this.analyser.dispatch('setFunctionState', {
                id: fn.id,
                enabled: e,
              }),
            untilDestroyed(this)
          ),
        ])
      )
    ),
    debug: stateFormControl(
      null,
      this.analyser.select(AnalyserState.debug),
      (d: boolean) => this.analyser.dispatch('setDebug', d),
      untilDestroyed(this)
    ),
    minPitch: stateFormControl(
      null,
      this.analyser.select(AnalyserState.minPitch),
      (p: number) => this.analyser.dispatch('setMinPitch', p),
      untilDestroyed(this),
      environment.throttle
    ),
    maxPitch: stateFormControl(
      null,
      this.analyser.select(AnalyserState.maxPitch),
      (p: number) => this.analyser.dispatch('setMaxPitch', p),
      untilDestroyed(this),
      environment.throttle
    ),
    peakType: stateFormControl(
      null,
      this.analyser.select(AnalyserState.fftPeakType),
      (t: FftPeakType) => this.analyser.dispatch('setFftPeakType', t),
      untilDestroyed(this),
      environment.throttle
    ),
    prominenceRadius: stateFormControl(
      null,
      this.analyser.select(AnalyserState.fftPeakProminenceRadius),
      (x: number) => this.analyser.dispatch('setFftPeakProminenceRadius', x),
      untilDestroyed(this),
      environment.throttle
    ),
    prominenceThreshold: stateFormControl(
      null,
      this.analyser.select(AnalyserState.fftPeakProminenceThreshold),
      (x: number) => this.analyser.dispatch('setFftPeakProminenceThreshold', x),
      untilDestroyed(this),
      environment.throttle
    ),
    prominenceNormalize: stateFormControl(
      null,
      this.analyser.select(AnalyserState.fftPeakProminenceNormalize),
      (x: boolean) => {
        return this.analyser.dispatch('setFftPeakProminenceNormalize', x);
      },
      untilDestroyed(this),
      environment.throttle
    ),
  });

  /**
   * Constructor.
   * @param graph
   */
  constructor(private readonly analyser: AnalyserService) {}
}
