import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { WorkletNode } from '../../classes/worklet-node/worklet-node';
import { AudioGraphSourceNode } from '../../interfaces';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { UntilDestroy } from '../../utils/angular.util';
import { stateFormControl } from '../../utils/ngxs.util';

@Component({
  selector: 'app-worklet-options',
  templateUrl: './worklet-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkletOptionsComponent extends UntilDestroy
  implements OnInit, OnDestroy {
  private readonly loaded = new BehaviorSubject<boolean>(false);

  public readonly loaded$ = this.loaded.asObservable();

  private readonly error = new BehaviorSubject<Error>(null);

  public readonly error$ = this.error.asObservable();

  public readonly types = WorkletNode.types;

  public form = new FormGroup({
    type: stateFormControl(
      null,
      this.graph.select(AudioGraphState.workletType),
      (t: number) => this.graph.dispatch('setWorkletType', t),
      this.destroyed$
    ),
  });

  /**
   * Constructor.
   * @param graph
   */
  constructor(private readonly graph: AudioGraphService) {
    super();
  }

  /**
   * Lifecycle hook.
   */
  public ngOnInit() {
    void this.graph
      .dispatch('setSourceNode', AudioGraphSourceNode.WORKLET)
      .subscribe(
        () => {
          this.loaded.next(true);
          this.loaded.complete();
        },
        err => this.setError(err)
      );
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    this.loaded.complete();
    this.error.complete();
  }

  /**
   * Set error
   * @param err
   */
  public setError(err: Error) {
    this.error.next(err);
  }
}
