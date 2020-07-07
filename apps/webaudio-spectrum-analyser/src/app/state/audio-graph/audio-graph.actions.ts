import { AudioGraphSource, AudioGraphSourceNode } from '../../interfaces';
import { actionConstructor, StoreActions } from '../../utils/ngxs.util';
import { AudioGraphStateModel, PitchDetectionState } from './audio-graph.model';

const action = actionConstructor('AudioGraph');

export const audioGraphAction: StoreActions = {
  setState: action<Partial<AudioGraphStateModel>>('set state'),

  play: action<void>('play'),
  pause: action<void>('pause'),
  toggle: action<void>('toggle'),

  reset: action<void>('reset'),

  setSourceNode: action<AudioGraphSourceNode>('set source node'),
  setSource: action<AudioGraphSource>('set source'),

  setDelay: action<number>('set delay'),
  setFftSize: action<number>('set fft size'),
  setMinPitch: action<number>('set min pitch'),
  setMaxPitch: action<number>('set max pitch'),
  setDebug: action<boolean>('set debug mode'),

  setPitchDetection: action<PitchDetectionState>('set pitch detection state'),
};
