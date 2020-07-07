/* eslint-disable compat/compat */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngxs/store';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { select, stateFormControl } from '../../utils/ngxs.util';

@UntilDestroy()
@Component({
  selector: 'app-common-options',
  templateUrl: './common-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonOptionsComponent {
  public delay$ = select<number>(this.store, 'delay');

  private readonly destroyed$ = untilDestroyed(this);

  public readonly fftSizes: number[] = this.graphService.getFftSizes();

  public readonly maxDelay: number = this.graphService.getMaxDelay();

  public readonly pitch = this.graphService.listPitchDetection();

  public readonly graph: AudioGraph = this.graphService.graph;

  public readonly graphForm = new FormGroup({
    delay: stateFormControl(
      null,
      this.delay$,
      (d: number) => this.graphService.setDelay(d),
      this.destroyed$,
      20
    ),
    fftSize: stateFormControl(
      null,
      select<number>(this.store, 'fftSize'),
      (s: number) => this.graphService.setFftSize(s),
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
            select<boolean>(this.store, pd.short),
            (e: boolean) => this.graphService.setPitchDetection(pd.short, e),
            this.destroyed$
          ),
        ])
      )
    ),
    debug: stateFormControl(
      null,
      select<boolean>(this.store, 'debug'),
      (d: boolean) => this.graphService.setDebug(d),
      this.destroyed$
    ),
    minPitch: stateFormControl(
      null,
      select<number>(this.store, 'minPitch'),
      (p: number) => this.graphService.setMinPitch(p),
      this.destroyed$,
      20
    ),
    maxPitch: stateFormControl(
      null,
      select<number>(this.store, 'maxPitch'),
      (p: number) => this.graphService.setMaxPitch(p),
      this.destroyed$,
      20
    ),
  });

  /**
   * Constructor.
   * @param graphService
   */
  constructor(
    private readonly graphService: AudioGraphService,
    private readonly store: Store
  ) {}
}
