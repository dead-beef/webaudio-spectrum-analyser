import { StateToken } from '@ngxs/store';

import { AnalyserState, FftPeakMask, FftPeakType } from '../../interfaces';

export type AnalyserStateModel = AnalyserState;

export const ANALYSER_STATE_DEFAULTS: AnalyserStateModel = {
  debug: false,
  historySize: 240,
  rmsThreshold: 0.01,
  harmonicSearchRadius: 0.3,
  pitch: {
    min: 20,
    max: 20000,
  },
  functions: {
    autocorr: false,
    prominence: false,
    cepstrum: false,
    fftPeaks: false,
    fftPeakDistance: false,
    fftHarmonics: false,
    RMS: true,
    ZCR: true,
    FFTP: false,
    AC: false,
    CP: false,
    MPD: false,
    F0: false,
  },
  fftp: {
    type: FftPeakType.MIN_FREQUENCY,
    prominence: {
      radius: 100,
      threshold: 10,
      normalize: false,
    },
  },
  fftpeaks: {
    mask: FftPeakMask.HANN,
    maskRadius: 100,
  },
};

export const ANALYSER_STATE_TOKEN = new StateToken<AnalyserStateModel>(
  'Analyser'
);
