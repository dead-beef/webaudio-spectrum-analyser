import {
  FftPeakMask,
  FftPeakType,
  PeakDistance,
  Peaks,
} from '../audio-math/interfaces';

export enum UnitType {
  TIME = 0,
  FREQUENCY,
  NUMBER,
  OTHER,
}

export type NumberUnitType =
  | UnitType.TIME
  | UnitType.FREQUENCY
  | UnitType.NUMBER;

export interface AnalyserFunction<T> {
  id: AnalyserFunctionId;
  name: string;
  unit: T extends number ? NumberUnitType : UnitType;
  calc: (prev: T) => T;
  enabled: boolean;
  value: T;
  updated: boolean;
}

export interface AnalyserFunctions {
  autocorr: AnalyserFunction<Float32Array>;
  prominence: AnalyserFunction<Float32Array>;
  cepstrum: AnalyserFunction<Float32Array>;
  fftPeaks: AnalyserFunction<Peaks>;
  fftPeakDistance: AnalyserFunction<PeakDistance>;
  fftHarmonics: AnalyserFunction<Peaks>;

  RMS: AnalyserFunction<number>;
  ZCR: AnalyserFunction<number>;
  FFTP: AnalyserFunction<number>;
  AC: AnalyserFunction<number>;
  CP: AnalyserFunction<number>;
  MPD: AnalyserFunction<number>;
  F0: AnalyserFunction<number>;
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

export interface FftPeaksState {
  mask: FftPeakMask;
  maskRadius: number;
}

export interface AnalyserState {
  debug: boolean;
  historySize: number;
  rmsThreshold: number;
  pitch: {
    min: number;
    max: number;
  };
  fftpeaks: FftPeaksState;
  fftp: FftPeakState;
  harmonicSearchRadius: number;
  functions: Record<AnalyserFunctionId, boolean>;
}
