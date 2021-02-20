import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { environment } from '../../../environments/environment';
import { Layouts } from '../../interfaces';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { stateFormControl } from '../../utils';

@UntilDestroy()
@Component({
  selector: 'app-graph-options',
  templateUrl: './graph-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphOptionsComponent {
  public layout = Layouts.VERTICAL;

  public readonly fftSizes: number[] = this.graph.getFftSizes();

  public readonly maxDelay: number = this.graph.getMaxDelay();

  public readonly form = new FormGroup({
    delay: stateFormControl(
      null,
      this.graph.select(AudioGraphState.delay),
      (d: number) => this.graph.dispatch('setDelay', d),
      untilDestroyed(this),
      environment.throttle
    ),
    fftSize: stateFormControl(
      null,
      this.graph.select(AudioGraphState.fftSize),
      (s: number) => this.graph.dispatch('setFftSize', s),
      untilDestroyed(this)
    ),
    smoothing: stateFormControl(
      null,
      this.graph.select(AudioGraphState.smoothing),
      (s: number) => this.graph.dispatch('setSmoothing', s),
      untilDestroyed(this),
      environment.throttle
    ),
  });

  /**
   * Constructor.
   * @param graph
   */
  constructor(private readonly graph: AudioGraphService) {}
}
