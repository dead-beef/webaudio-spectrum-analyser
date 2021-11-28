import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { environment } from '../../../environments/environment';
import {
  AudioGraphFilterNode,
  Layouts,
  WorkletFilterType,
} from '../../interfaces';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { deepEqual, stateFormControl } from '../../utils';

@UntilDestroy()
@Component({
  selector: 'app-filter-options',
  templateUrl: './filter-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterOptionsComponent {
  public layout = Layouts.VERTICAL;

  public filter$ = this.graph.select(AudioGraphState.filter);

  public readonly fftSizes: number[] = this.graph
    .getFftSizes()
    .filter(s => s >= 128);

  public readonly filters = [
    { id: AudioGraphFilterNode.NONE, name: 'None' },
    { id: AudioGraphFilterNode.IIR, name: 'IIR' },
    { id: AudioGraphFilterNode.BIQUAD, name: 'Biquad' },
    { id: AudioGraphFilterNode.CONVOLVER, name: 'Convolver' },
    { id: AudioGraphFilterNode.PITCH_SHIFTER, name: 'Pitch shifter' },
    { id: AudioGraphFilterNode.WORKLET, name: 'Worklet' },
  ];

  public readonly workletFilterTypes = [
    { id: WorkletFilterType.NONE, name: 'None' },
    { id: WorkletFilterType.SCALE_HARMONICS, name: 'Scale harmonics' },
    { id: WorkletFilterType.ADD_HARMONICS, name: 'Add harmonics' },
  ];

  public readonly iirFilterOrder = [0, 1, 2];

  public readonly audioGraphFilterNode = AudioGraphFilterNode;

  public readonly form = new FormGroup({
    type: stateFormControl(
      null,
      this.graph.select(AudioGraphState.filter),
      (f: AudioGraphFilterNode) => this.graph.dispatch('setFilter', f),
      untilDestroyed(this)
    ),

    iir: stateFormControl(
      new FormGroup({
        feedforward: this.fb.array(this.iirFilterOrder),
        feedback: this.fb.array(this.iirFilterOrder),
      }),
      this.graph.select(AudioGraphState.iirState),
      data => this.graph.dispatch('setIirState', data),
      untilDestroyed(this),
      environment.throttle,
      deepEqual
    ),

    convolver: stateFormControl(
      this.fb.group({
        duration: 0,
        decay: 0,
        frequency: 0,
        overtones: 0,
        overtoneDecay: 0,
      }),
      this.graph.select(AudioGraphState.convolverState),
      data => this.graph.dispatch('setConvolverState', data),
      untilDestroyed(this),
      environment.throttle,
      deepEqual
    ),

    biquad: stateFormControl(
      this.fb.group({
        type: '',
        frequency: 0,
        detune: 0,
        gain: 0,
        q: 0,
      }),
      this.graph.select(AudioGraphState.biquadState),
      data => this.graph.dispatch('setBiquadState', data),
      untilDestroyed(this),
      environment.throttle,
      deepEqual
    ),

    pitchShifter: stateFormControl(
      this.fb.group({
        shift: 0,
        bufferTime: 0,
      }),
      this.graph.select(AudioGraphState.pitchShifterState),
      data => this.graph.dispatch('setPitchShifterState', data),
      untilDestroyed(this),
      environment.throttle,
      deepEqual
    ),

    worklet: stateFormControl(
      this.fb.group({
        fftSize: 0,
        type: 0,
        gain: 0,
        minPitch: 0,
        maxPitch: 0,
        minHarmonic: 0,
        maxHarmonic: 0,
        step: 0,
        harmonicGain: 0,
        fScaleRadius: 0,
        harmonicSearchRadius: 0,
        smoothScale: 0,
      }),
      this.graph.select(AudioGraphState.workletFilterState),
      data => this.graph.dispatch('setWorkletFilterState', data),
      untilDestroyed(this),
      environment.throttle,
      deepEqual
    ),
  });

  public readonly iirForm = this.form.controls.iir as FormGroup;

  public readonly iirControls = this.iirForm.controls as Record<
    string,
    FormArray
  >;

  /**
   * Constructor.
   * @param graph
   */
  constructor(
    private readonly fb: FormBuilder,
    private readonly graph: AudioGraphService
  ) {}
}
