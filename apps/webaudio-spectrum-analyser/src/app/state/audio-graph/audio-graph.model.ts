import { StateToken } from '@ngxs/store';

import { AudioGraphSourceNode } from '../../interfaces';

export interface AudioGraphStateModel {
  paused: boolean;
  suspended: boolean;
  sourceNode: AudioGraphSourceNode;
}

export const audioGraphStateDefaults: AudioGraphStateModel = {
  paused: true,
  suspended: true,
  sourceNode: AudioGraphSourceNode.WAVE,
};

export const AUDIO_GRAPH_STATE_TOKEN = new StateToken<AudioGraphStateModel>(
  'AudioGraph'
);
