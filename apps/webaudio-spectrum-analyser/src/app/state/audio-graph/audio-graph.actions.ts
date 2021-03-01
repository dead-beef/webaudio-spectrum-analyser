import {
  AudioGraphFilterNode,
  AudioGraphSource,
  AudioGraphSourceNode,
  BiquadState,
  ConvolverState,
  IirState,
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
};
