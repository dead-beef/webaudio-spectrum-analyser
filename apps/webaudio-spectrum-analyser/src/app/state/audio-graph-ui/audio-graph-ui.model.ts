import { StateToken } from '@ngxs/store';

import { ChartLayout, ChartType } from '../../interfaces';

export interface SetChartType {
  index: number;
  type: ChartType;
}

export interface AudioGraphUiStateModel {
  chartCount: number;
  chartType: ChartType[];
  chartLayout: ChartLayout;
}

export const AUDIO_GRAPH_UI_STATE_DEFAULTS: AudioGraphUiStateModel = {
  chartCount: 2,
  chartType: [ChartType.TIME_DOMAIN, ChartType.FREQUENCY],
  chartLayout: ChartLayout.VERTICAL,
};

export const AUDIO_GRAPH_UI_STATE_TOKEN = new StateToken<AudioGraphUiStateModel>(
  'AudioGraphUi'
);
