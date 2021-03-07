import { FftPeakType } from '../audio-math/interfaces';

export type AnalyserFunctionId = 'RMS' | 'ZCR' | 'FFTM' | 'FFTP' | 'AC';

export interface AnalyserFunction {
  id: AnalyserFunctionId;
  name: string;
  calc: () => number;
  timeDomain: boolean;
  enabled: boolean;
  value: number;
}

export interface AnalyserFunctionState {
  id: AnalyserFunctionId;
  enabled: boolean;
}

export interface FftPeakState {
  type: FftPeakType;
  prominence: {
    radius: number;
    threshold: number;
    normalize: boolean;
  };
}

export interface AnalyserState {
  debug: boolean;
  historySize: number;
  pitch: {
    min: number;
    max: number;
  };
  fftp: FftPeakState;
  functions: Record<AnalyserFunctionId, boolean>;
}
