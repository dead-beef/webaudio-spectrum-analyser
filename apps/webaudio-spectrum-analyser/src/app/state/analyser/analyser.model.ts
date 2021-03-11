import { StateToken } from '@ngxs/store';

import { AnalyserState, FftPeakType } from '../../interfaces';

export type AnalyserStateModel = AnalyserState;

export const ANALYSER_STATE_DEFAULTS: AnalyserStateModel = {
  debug: false,
  historySize: 240,
  pitch: {
    min: 20,
    max: 20000,
  },
  functions: {
    autocorr: false,
    prominence: false,
    cepstrum: false,
    RMS: true,
    ZCR: true,
    FFTM: false,
    FFTP: false,
    AC: false,
  },
  fftp: {
    type: FftPeakType.MIN_FREQUENCY,
    prominence: {
      radius: 0,
      threshold: 0.1,
      normalize: false,
    },
  },
};

export const ANALYSER_STATE_TOKEN = new StateToken<AnalyserStateModel>(
  'Analyser'
);
