import { StateToken } from '@ngxs/store';

import { AudioGraphSourceNode, PitchDetectionId } from '../../interfaces';

export interface AudioGraphStateModel {
  paused: boolean;
  suspended: boolean;
  debug: boolean;
  ZCR: boolean;
  FFTM: boolean;
  FFTP: boolean;
  AC: boolean;
  sourceNode: AudioGraphSourceNode;
  delay: number;
  fftSize: number;
  minPitch: number;
  maxPitch: number;
}

export interface PitchDetectionState {
  id: PitchDetectionId;
  enabled: boolean;
}

export const audioGraphStateDefaults: AudioGraphStateModel = {
  paused: true,
  suspended: true,
  debug: false,
  ZCR: true,
  FFTM: false,
  FFTP: false,
  AC: false,
  sourceNode: AudioGraphSourceNode.WAVE,
  delay: 0,
  fftSize: 2048,
  minPitch: 20,
  maxPitch: 20000,
};

export const AUDIO_GRAPH_STATE_TOKEN = new StateToken<AudioGraphStateModel>(
  'AudioGraph'
);
