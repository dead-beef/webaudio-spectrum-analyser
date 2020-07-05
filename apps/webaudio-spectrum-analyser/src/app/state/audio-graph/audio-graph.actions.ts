import { actionConstructor, StoreActions } from '../../utils/ngxs.util';
import { AudioGraphStateModel } from './audio-graph.model';
import { AudioGraphSource, AudioGraphSourceNode } from '../../interfaces';

const action = actionConstructor('AudioGraph');

export const audioGraphAction: StoreActions = {
  setState: action<Partial<AudioGraphStateModel>>('set state'),

  play: action<void>('play'),
  pause: action<void>('pause'),
  toggle: action<void>('toggle'),

  reset: action<void>('reset'),

  setSourceNode: action<AudioGraphSourceNode>('set source node'),
  setSource: action<AudioGraphSource>('set source'),
};
