import { StateToken } from '@ngxs/store';

import { AudioGraphUiStateModel, ChartLayout, ChartType } from './interfaces';

export { AudioGraphUiStateModel } from './interfaces';

export const AUDIO_GRAPH_UI_STATE_DEFAULTS: AudioGraphUiStateModel = {
  chartCount: 2,
  chartType: [ChartType.TIME_DOMAIN, ChartType.FREQUENCY],
  chartLayout: ChartLayout.VERTICAL,
};

export const AUDIO_GRAPH_UI_STATE_TOKEN =
  new StateToken<AudioGraphUiStateModel>('AudioGraphUi');
