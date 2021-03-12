import { FftPeakType } from '../audio-math/interfaces';

export interface AnalyserFunction<T> {
  id: AnalyserFunctionId;
  name: string;
  calc: (prev: T) => T;
  enabled: boolean;
  value: T;
  updated: boolean;
}

export interface AnalyserFunctions {
  autocorr: AnalyserFunction<Float32Array>;
  prominence: AnalyserFunction<Float32Array>;
  cepstrum: AnalyserFunction<Float32Array>;

  RMS: AnalyserFunction<number>;
  ZCR: AnalyserFunction<number>;
  FFTM: AnalyserFunction<number>;
  FFTP: AnalyserFunction<number>;
  AC: AnalyserFunction<number>;
  CM: AnalyserFunction<number>;
  CP: AnalyserFunction<number>;
}

export type AnalyserFunctionId = keyof AnalyserFunctions;

export type AnalyserNumberFunctionId = FilterKeysByPropertyType<
  AnalyserFunctions,
  'value',
  number
>;

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
