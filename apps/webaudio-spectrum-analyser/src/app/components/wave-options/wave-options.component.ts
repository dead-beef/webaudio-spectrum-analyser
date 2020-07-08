import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { environment } from '../../../environments/environment';
import { AudioGraphSourceNode } from '../../interfaces';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { stateFormControl } from '../../utils/ngxs.util';

@UntilDestroy()
@Component({
  selector: 'app-wave-options',
  templateUrl: './wave-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaveOptionsComponent implements OnInit {
  private readonly destroyed$ = untilDestroyed(this);

  public readonly form = new FormGroup({
    shape: stateFormControl(
      null,
      this.graph.select(AudioGraphState.waveShape),
      (t: OscillatorType) => this.graph.dispatch('setWaveShape', t),
      this.destroyed$
    ),
    frequency: stateFormControl(
      null,
      this.graph.select(AudioGraphState.waveFrequency),
      (f: number) => this.graph.dispatch('setWaveFrequency', f),
      this.destroyed$,
      environment.throttle
    ),
  });

  /**
   * Constructor.
   * @param graphService
   */
  constructor(private readonly graph: AudioGraphService) {}

  /**
   * Lifecycle hook.
   */
  public ngOnInit() {
    void this.graph.dispatch('setSourceNode', AudioGraphSourceNode.WAVE);
  }
}
