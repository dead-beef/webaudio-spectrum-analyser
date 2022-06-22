import {
  AnalyserFunctionState,
  FftPeakMask,
  FftPeakType,
} from '../../interfaces';
import { actionConstructor, StoreActions } from '../../utils';
import { AnalyserStateModel } from './analyser.model';

const action = actionConstructor('Analyser');

export const analyserAction: StoreActions = {
  reset: action<void>('reset'),

  setDebug: action<boolean>('set debug'),
  setHistorySize: action<number>('set history size'),
  setRmsThreshold: action<number>('set rms threshold'),

  setState: action<AnalyserStateModel>('set state'),

  setMinPitch: action<number>('set min pitch'),
  setMaxPitch: action<number>('set max pitch'),
  setFunctionState: action<AnalyserFunctionState>('set function state'),

  setFftPeakType: action<FftPeakType>('set fft peak type'),
  setFftPeakProminenceRadius: action<number>('set fft peak prominence radius'),
  setFftPeakProminenceThreshold: action<number>(
    'set fft peak prominence threshold'
  ),
  setFftPeakProminenceNormalize: action<boolean>(
    'set fft peak prominence normalize'
  ),

  setFftPeakMask: action<FftPeakMask>('set fft peak mask'),
  setFftPeakMaskRadius: action<number>('set fft peak mask radius'),

  setHarmonicSearchRadius: action<number>('set harmonic search radius'),
};
