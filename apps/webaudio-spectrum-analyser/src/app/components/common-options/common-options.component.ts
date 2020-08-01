/* eslint-disable compat/compat */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { AudioGraphFilterNode } from '../../interfaces';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { UntilDestroy } from '../../utils/angular.util';
import { stateFormControl } from '../../utils/ngxs.util';
import { deepEqual } from '../../utils/rxjs.util';

@Component({
  selector: 'app-common-options',
  templateUrl: './common-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonOptionsComponent extends UntilDestroy {
  public filter$ = this.graph.select(AudioGraphState.filter);

  public readonly fftSizes: number[] = this.graph.getFftSizes();

  public readonly maxDelay: number = this.graph.getMaxDelay();

  public readonly pitch = this.graph.listPitchDetection();

  public readonly filters = [
    { id: AudioGraphFilterNode.NONE, name: 'None' },
    { id: AudioGraphFilterNode.IIR, name: 'IIR' },
    { id: AudioGraphFilterNode.BIQUAD, name: 'Biquad' },
    { id: AudioGraphFilterNode.CONVOLVER, name: 'Convolver' },
    { id: AudioGraphFilterNode.PITCH_SHIFTER, name: 'Pitch shifter' },
  ];

  public readonly iirFilterOrder = [0, 1, 2];

  public readonly AudioGraphFilterNode = AudioGraphFilterNode;

  public readonly graphForm = new FormGroup({
    delay: stateFormControl(
      null,
      this.graph.select(AudioGraphState.delay),
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
    smoothing: stateFormControl(
      new FormArray(this.graph.graph.smoothing.map(() => new FormControl(0))),
      this.graph.select(AudioGraphState.smoothing),
      (s: number[]) => this.graph.dispatch('setSmoothing', s),
      this.destroyed$,
      environment.throttle,
      deepEqual
    ),
  });

  public readonly filterForm = new FormGroup({
    type: stateFormControl(
      null,
      this.graph.select(AudioGraphState.filter),
      (f: AudioGraphFilterNode) => this.graph.dispatch('setFilter', f),
      this.destroyed$
    ),

    iir: stateFormControl(
      new FormGroup({
        feedforward: new FormArray(
          this.iirFilterOrder.map(() => new FormControl(0))
        ),
        feedback: new FormArray(
          this.iirFilterOrder.map(() => new FormControl(0))
        ),
      }),
      this.graph.select(AudioGraphState.iirState),
      data => this.graph.dispatch('setIirState', data),
      this.destroyed$,
      environment.throttle,
      deepEqual
    ),

    convolver: stateFormControl(
      new FormGroup({
        duration: new FormControl(),
        decay: new FormControl(),
        frequency: new FormControl(),
        overtones: new FormControl(),
        overtoneDecay: new FormControl(),
      }),
      this.graph.select(AudioGraphState.convolverState),
      data => this.graph.dispatch('setConvolverState', data),
      this.destroyed$,
      environment.throttle,
      deepEqual
    ),

    biquad: new FormGroup({
      type: stateFormControl(
        null,
        this.graph.select(AudioGraphState.biquadType),
        (t: BiquadFilterType) => this.graph.dispatch('setBiquadType', t),
        this.destroyed$
      ),
      frequency: stateFormControl(
        null,
        this.graph.select(AudioGraphState.biquadFrequency),
        (f: number) => this.graph.dispatch('setBiquadFrequency', f),
        this.destroyed$,
        environment.throttle
      ),
      detune: stateFormControl(
        null,
        this.graph.select(AudioGraphState.biquadDetune),
        (d: number) => this.graph.dispatch('setBiquadDetune', d),
        this.destroyed$,
        environment.throttle
      ),
      gain: stateFormControl(
        null,
        this.graph.select(AudioGraphState.biquadGain),
        (g: number) => this.graph.dispatch('setBiquadGain', g),
        this.destroyed$,
        environment.throttle
      ),
      q: stateFormControl(
        null,
        this.graph.select(AudioGraphState.biquadQ),
        (q: number) => this.graph.dispatch('setBiquadQ', q),
        this.destroyed$,
        environment.throttle
      ),
    }),

    pitchShifter: new FormGroup({
      shift: stateFormControl(
        null,
        this.graph.select(AudioGraphState.pitchShift),
        (s: number) => this.graph.dispatch('setPitchShift', s),
        this.destroyed$,
        environment.throttle
      ),
      bufferTime: stateFormControl(
        null,
        this.graph.select(AudioGraphState.pitchShifterBufferTime),
        (t: number) => this.graph.dispatch('setPitchShifterBufferTime', t),
        this.destroyed$,
        environment.throttle
      ),
    }),
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

  public readonly iirForm: FormGroup = this.filterForm.controls
    .iir as FormGroup;

  public readonly smoothingForm: FormArray = this.graphForm.controls
    .smoothing as FormArray;

  /**
   * Constructor.
   * @param graph
   */
  constructor(private readonly graph: AudioGraphService) {
    super();
  }
}
