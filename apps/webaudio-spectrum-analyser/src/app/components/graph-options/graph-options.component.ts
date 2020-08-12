import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { UntilDestroy } from '../../utils/angular.util';
import { stateFormControl } from '../../utils/ngxs.util';
import { deepEqual } from '../../utils/rxjs.util';

@Component({
  selector: 'app-graph-options',
  templateUrl: './graph-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphOptionsComponent extends UntilDestroy {
  public readonly fftSizes: number[] = this.graph.getFftSizes();

  public readonly maxDelay: number = this.graph.getMaxDelay();

  public readonly form = new FormGroup({
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

  public readonly smoothingForm: FormArray = this.form.controls
    .smoothing as FormArray;

  /**
   * Constructor.
   * @param graph
   */
  constructor(private readonly graph: AudioGraphService) {
    super();
  }
}
