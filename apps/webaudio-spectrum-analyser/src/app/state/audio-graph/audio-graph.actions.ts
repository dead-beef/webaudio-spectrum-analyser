import {
  AudioGraphFilterNode,
  AudioGraphSource,
  AudioGraphSourceNode,
  FftPeakType,
} from '../../interfaces';
import { actionConstructor, StoreActions } from '../../utils';
import {
  AudioGraphStateModel,
  ConvolverState,
  IirState,
  PitchDetectionState,
} from './audio-graph.model';

const action = actionConstructor('AudioGraph');

export const audioGraphAction: StoreActions = {
  setState: action<Partial<AudioGraphStateModel>>('set state'),

  play: action<void>('play'),
  pause: action<void>('pause'),
  toggle: action<void>('toggle'),
  setVolume: action<number>('set volume'),

  reset: action<void>('reset'),

  setSourceNode: action<AudioGraphSourceNode>('set source node'),
  setSource: action<AudioGraphSource>('set source'),

  setDelay: action<number>('set delay'),
  setFftSize: action<number>('set fft size'),
  setSmoothing: action<number[]>('set smoothing'),
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
  setBiquadType: action<BiquadFilterType>('set biquad filter type'),
  setBiquadFrequency: action<number>('set biquad filter frequency'),
  setBiquadQ: action<number>('set biquad filter q factor'),
  setBiquadDetune: action<number>('set biquad filter detune'),
  setBiquadGain: action<number>('set biquad filter gain'),
  setPitchShift: action<number>('set pitch shift'),
  setPitchShifterBufferTime: action<number>('set pitch shifter buffer time'),

  setFftPeakType: action<FftPeakType>('set fft peak type'),
  setFftPeakProminenceRadius: action<number>('set fft peak prominence radius'),
  setFftPeakProminenceThreshold: action<number>(
    'set fft peak prominence threshold'
  ),
  setFftPeakProminenceNormalize: action<boolean>(
    'set fft peak prominence normalize'
  ),
};
