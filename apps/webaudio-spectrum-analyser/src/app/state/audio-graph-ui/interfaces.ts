export enum ChartLayout {
  VERTICAL,
  HORIZONTAL,
  GRID,
  _COUNT,
}

export enum ChartType {
  TIME_DOMAIN,
  FREQUENCY,
  SPECTROGRAM,
  CEPSTRUM,
  FREQUENCY_DOMAIN_FUNCTIONS,
  TIME_DOMAIN_FUNCTIONS,
}

export interface SetChartType {
  index: number;
  type: ChartType;
}

export interface AudioGraphUiStateModel {
  chartCount: number;
  chartType: ChartType[];
  chartLayout: ChartLayout;
}
