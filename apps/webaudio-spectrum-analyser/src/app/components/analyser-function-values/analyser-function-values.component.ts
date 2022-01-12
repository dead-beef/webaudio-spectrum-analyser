import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  AnalyserFunctionDomain,
  AnalyserNumberFunctionId,
} from '../../interfaces';
import { ColorService } from '../../services/color/color.service';
import { AnalyserService } from '../../state/analyser/analyser.service';
import { AnalyserState } from '../../state/analyser/analyser.store';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';

@Component({
  selector: 'app-analyser-function-values',
  templateUrl: './analyser-function-values.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/* eslint-disable prettier/prettier -- prettier conflicts with eslint (brace style) */
export class AnalyserFunctionValuesComponent
  implements OnInit, OnDestroy, OnChanges {
  /* eslint-enable prettier/prettier -- prettier conflicts with eslint (brace style) */
  @Input() public ids: AnalyserNumberFunctionId[] = [];

  private readonly graph = this.graphService.graph;

  private readonly analyser = this.analyserService.analyser;

  public functionColor: string[] = [];

  public functionDomain: AnalyserFunctionDomain[] = [];

  private readonly updateBound = this.update.bind(this);

  private values: BehaviorSubject<number>[] = [];

  public values$: Observable<number>[] = [];

  public functionEnabled$: Observable<boolean>[] = [];

  /**
   * Constructor.
   */
  constructor(
    private readonly graphService: AudioGraphService,
    private readonly analyserService: AnalyserService,
    private readonly color: ColorService
  ) {}

  /**
   * Lifecycle hook.
   */
  public ngOnInit(): void {
    this.graph.onUpdate(this.updateBound);
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy(): void {
    this.graph.offUpdate(this.updateBound);
    this.completeSubjects();
  }

  /**
   * Lifecycle hook.
   */
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.ids) {
      this.completeSubjects();
      this.functionColor = this.ids.map(id => this.color.get(id));
      this.functionDomain = this.ids.map(
        id => this.analyser.functionById[id].domain
      );
      this.values = this.ids.map(_ => new BehaviorSubject<number>(0));
      this.values$ = this.values.map(subject => {
        return subject.asObservable();
      });
      this.functionEnabled$ = this.ids.map(fn => {
        return this.analyserService.select(AnalyserState.functionEnabled(fn));
      });
    }
  }

  /**
   * TODO: description
   */
  public completeSubjects() {
    for (const subject of this.values) {
      subject.complete();
    }
  }

  /**
   * TODO: description
   */
  public update(paused: boolean) {
    if (paused && !this.analyser.updated) {
      return;
    }
    for (let i = 0; i < this.ids.length; ++i) {
      const id = this.ids[i];
      const value: Nullable<number> = this.analyser.getOptional(id);
      if (value !== null) {
        this.values[i].next(value);
      }
    }
  }
}
