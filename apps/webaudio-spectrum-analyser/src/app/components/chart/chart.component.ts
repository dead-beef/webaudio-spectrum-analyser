import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { AnalyserFunctionDomain, ChartType } from '../../interfaces';
import { audioGraphUiAction } from '../../state/audio-graph-ui/audio-graph-ui.actions';
import { AudioGraphUiState } from '../../state/audio-graph-ui/audio-graph-ui.store';
import { stateFormControl } from '../../utils';

@UntilDestroy()
@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent implements OnInit, OnChanges {
  @Input() public index = -1;

  public type$: Observable<ChartType> = of();

  public title$: Observable<string> = of();

  public readonly form = new FormGroup({
    type: new FormControl(0),
  });

  public readonly chartType = ChartType;

  public readonly anaylserFunctionDomain = AnalyserFunctionDomain;

  public readonly types = [
    { id: ChartType.TIME_DOMAIN, name: 'Time domain' },
    { id: ChartType.FREQUENCY, name: 'Frequency domain' },
    { id: ChartType.SPECTROGRAM, name: 'Spectrogram' },
    { id: ChartType.CEPSTRUM, name: 'Cepstrum' },
    {
      id: ChartType.TIME_DOMAIN_FUNCTIONS,
      name: 'Functions (time domain)',
    },
    {
      id: ChartType.FREQUENCY_DOMAIN_FUNCTIONS,
      name: 'Functions (frequency domain)',
    },
  ];

  public readonly titles: Record<ChartType, string> = Object.fromEntries(
    this.types.map(t => [t.id, t.name])
  ) as any;

  /**
   * Constructor.
   */
  constructor(private readonly store: Store) {}

  /**
   * Lifecycle hook.
   */
  public ngOnInit() {
    this.type$ = this.store.select(AudioGraphUiState.chartType(this.index));
    this.title$ = this.type$.pipe(map(t => this.titles[t]));
    stateFormControl(
      this.form.controls.type,
      this.store.select(AudioGraphUiState.chartType(this.index)),
      (t: ChartType) =>
        this.store.dispatch(
          new audioGraphUiAction.setChartType({ index: this.index, type: t })
        ),
      untilDestroyed(this)
    );
  }

  /**
   * Lifecycle hook.
   */
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.index && !changes.index.isFirstChange()) {
      console.warn('chart index changed:', changes.index);
    }
  }

  /**
   * TODO: description
   */
  public moveUp() {
    void this.store.dispatch(new audioGraphUiAction.moveChartUp(this.index));
  }

  /**
   * TODO: description
   */
  public moveDown() {
    void this.store.dispatch(new audioGraphUiAction.moveChartDown(this.index));
  }

  /**
   * TODO: description
   */
  public remove() {
    void this.store.dispatch(new audioGraphUiAction.removeChart(this.index));
  }

  /**
   * TODO: description
   */
  public add() {
    void this.store.dispatch(new audioGraphUiAction.addChart(this.index));
  }

  /**
   * TODO: description
   */
  public toggleLayout() {
    void this.store.dispatch(new audioGraphUiAction.toggleChartLayout());
  }
}
