import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';

import { ChartLayout } from '../../interfaces';
import { AudioGraphUiState } from '../../state/audio-graph-ui/audio-graph-ui.store';
import { range } from '../../utils';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartsComponent {
  public readonly layoutClass = {
    [ChartLayout.VERTICAL]: 'chart-layout chart-layout-vertical',
    [ChartLayout.HORIZONTAL]: 'chart-layout chart-layout-hoizontal',
    [ChartLayout.GRID]: 'chart-layout chart-layout-grid',
  };

  public readonly index$ = this.store
    .select(AudioGraphUiState.chartCount)
    .pipe(map(range));

  public readonly layout$ = this.store
    .select(AudioGraphUiState.chartLayout)
    .pipe(map(l => this.layoutClass[l] || ''));

  /**
   * Constructor.
   * @param graph
   */
  constructor(private readonly store: Store) {}

  /**
   * TODO: description
   */
  public trackBy(i: number, item: any): number {
    return item;
  }
}
