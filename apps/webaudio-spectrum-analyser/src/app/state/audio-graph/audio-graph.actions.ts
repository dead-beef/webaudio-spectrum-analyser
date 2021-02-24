import {
  AudioGraphFilterNode,
  AudioGraphSource,
  AudioGraphSourceNode,
  BiquadState,
  ConvolverState,
  FftPeakType,
  IirState,
  PitchDetectionState,
  PitchShifterState,
  WorkletFilterState,
} from '../../interfaces';
import { actionConstructor, StoreActions } from '../../utils';
import { AudioGraphStateModel } from './audio-graph.model';

const action = actionConstructor('AudioGraph');

export const audioGraphAction: StoreActions = {
  setState: action<AudioGraphStateModel>('set state'),

  play: action<void>('play'),
  pause: action<void>('pause'),
  toggle: action<void>('toggle'),
  setVolume: action<number>('set volume'),

  reset: action<void>('reset'),

  setSourceNode: action<AudioGraphSourceNode>('set source node'),
  setSource: action<AudioGraphSource>('set source'),

  setDelay: action<number>('set delay'),
  setFftSize: action<number>('set fft size'),
  setSmoothing: action<number>('set smoothing'),
  setDebug: action<boolean>('set debug mode'),

  setMinPitch: action<number>('set min pitch'),
  setMaxPitch: action<number>('set max pitch'),
  setPitchDetection: action<PitchDetectionState>('set pitch detection state'),

  setWaveShape: action<string>('set wave shape'),
  setWaveFrequency: action<number>('set wave frequency'),

  setDeviceId: action<string>('set device id'),

  setWorkletType: action<number>('set worklet type'),

  setFilter: action<AudioGraphFilterNode>('set filter'),
  setConvolverState: action<ConvolverState>('set convolver filter state'),
  setIirState: action<IirState>('set iir filter state'),
  setBiquadState: action<BiquadState>('set biquad filter state'),
  setPitchShifterState: action<PitchShifterState>('set pitch shifter state'),
  setWorkletFilterState: action<WorkletFilterState>('set worklet filter state'),

  setFftPeakType: action<FftPeakType>('set fft peak type'),
  setFftPeakProminenceRadius: action<number>('set fft peak prominence radius'),
  setFftPeakProminenceThreshold: action<number>(
    'set fft peak prominence threshold'
  ),
  setFftPeakProminenceNormalize: action<boolean>(
    'set fft peak prominence normalize'
  ),
};
