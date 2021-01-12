import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { environment } from '../../../environments/environment';
import { AudioGraphFilterNode, Layouts } from '../../interfaces';
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

  public readonly filters = [
    { id: AudioGraphFilterNode.NONE, name: 'None' },
    { id: AudioGraphFilterNode.IIR, name: 'IIR' },
    { id: AudioGraphFilterNode.BIQUAD, name: 'Biquad' },
    { id: AudioGraphFilterNode.CONVOLVER, name: 'Convolver' },
    { id: AudioGraphFilterNode.PITCH_SHIFTER, name: 'Pitch shifter' },
    { id: AudioGraphFilterNode.WORKLET, name: 'Worklet' },
  ];

  public readonly iirFilterOrder = [0, 1, 2];

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public readonly AudioGraphFilterNode = AudioGraphFilterNode;

  public readonly form = new FormGroup({
    type: stateFormControl(
      null,
      this.graph.select(AudioGraphState.filter),
      (f: AudioGraphFilterNode) => this.graph.dispatch('setFilter', f),
      untilDestroyed(this)
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
      untilDestroyed(this),
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
      untilDestroyed(this),
      environment.throttle,
      deepEqual
    ),

    biquad: new FormGroup({
      type: stateFormControl(
        null,
        this.graph.select(AudioGraphState.biquadType),
        (t: BiquadFilterType) => this.graph.dispatch('setBiquadType', t),
        untilDestroyed(this)
      ),
      frequency: stateFormControl(
        null,
        this.graph.select(AudioGraphState.biquadFrequency),
        (f: number) => this.graph.dispatch('setBiquadFrequency', f),
        untilDestroyed(this),
        environment.throttle
      ),
      detune: stateFormControl(
        null,
        this.graph.select(AudioGraphState.biquadDetune),
        (d: number) => this.graph.dispatch('setBiquadDetune', d),
        untilDestroyed(this),
        environment.throttle
      ),
      gain: stateFormControl(
        null,
        this.graph.select(AudioGraphState.biquadGain),
        (g: number) => this.graph.dispatch('setBiquadGain', g),
        untilDestroyed(this),
        environment.throttle
      ),
      q: stateFormControl(
        null,
        this.graph.select(AudioGraphState.biquadQ),
        (q: number) => this.graph.dispatch('setBiquadQ', q),
        untilDestroyed(this),
        environment.throttle
      ),
    }),

    pitchShifter: new FormGroup({
      shift: stateFormControl(
        null,
        this.graph.select(AudioGraphState.pitchShift),
        (s: number) => this.graph.dispatch('setPitchShift', s),
        untilDestroyed(this),
        environment.throttle
      ),
      bufferTime: stateFormControl(
        null,
        this.graph.select(AudioGraphState.pitchShifterBufferTime),
        (t: number) => this.graph.dispatch('setPitchShifterBufferTime', t),
        untilDestroyed(this),
        environment.throttle
      ),
    }),

    worklet: new FormGroup({}),
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
  constructor(private readonly graph: AudioGraphService) {}
}
