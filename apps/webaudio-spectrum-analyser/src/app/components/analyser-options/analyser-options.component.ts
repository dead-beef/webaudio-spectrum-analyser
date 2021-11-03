import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { environment } from '../../../environments/environment';
import {
  AnalyserFunctionId,
  FftPeakMask,
  FftPeakType,
  Layouts,
} from '../../interfaces';
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

  public readonly peakTypes = [
    { id: FftPeakType.MIN_FREQUENCY, name: 'Min frequency' },
    { id: FftPeakType.MAX_PROMINENCE, name: 'Max prominence' },
  ];

  public readonly peakMaskTypes = [
    { id: FftPeakMask.NONE, name: 'None' },
    { id: FftPeakMask.CONST, name: 'Constant' },
    { id: FftPeakMask.LINEAR, name: 'Linear' },
  ];

  public readonly functionId: AnalyserFunctionId[] = [
    ...this.analyser.analyser.TIME_DOMAIN_FUNCTION_IDS,
    ...this.analyser.analyser.FREQUENCY_DOMAIN_FUNCTION_IDS,
  ];

  public readonly functionName: string[] = this.functionId.map(id =>
    this.analyser.analyser.getName(id)
  );

  public readonly form = new FormGroup({
    enabled: new FormGroup(
      Object.fromEntries(
        this.functionId.map(id => [
          id,
          stateFormControl(
            null,
            this.analyser.select(AnalyserState.functionEnabled(id)),
            (e: boolean) =>
              this.analyser.dispatch('setFunctionState', {
                id,
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
    rmsThreshold: stateFormControl(
      null,
      this.analyser.select(AnalyserState.rmsThreshold),
      (t: number) => this.analyser.dispatch('setRmsThreshold', t),
      untilDestroyed(this),
      environment.throttle
    ),
    historySize: stateFormControl(
      null,
      this.analyser.select(AnalyserState.historySize),
      (s: number) => this.analyser.dispatch('setHistorySize', s),
      untilDestroyed(this),
      environment.throttle
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
    peakMask: stateFormControl(
      null,
      this.analyser.select(AnalyserState.fftPeakMask),
      (x: FftPeakMask) => {
        return this.analyser.dispatch('setFftPeakMask', x);
      },
      untilDestroyed(this)
    ),
    peakMaskRadius: stateFormControl(
      null,
      this.analyser.select(AnalyserState.fftPeakMaskRadius),
      (x: number) => {
        return this.analyser.dispatch('setFftPeakMaskRadius', x);
      },
      untilDestroyed(this),
      environment.throttle
    ),
    peakType: stateFormControl(
      null,
      this.analyser.select(AnalyserState.fftPeakType),
      (t: FftPeakType) => this.analyser.dispatch('setFftPeakType', t),
      untilDestroyed(this)
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
      untilDestroyed(this)
    ),
  });

  /**
   * Constructor.
   */
  constructor(private readonly analyser: AnalyserService) {}
}
