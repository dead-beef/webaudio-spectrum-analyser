import { StateToken } from '@ngxs/store';

import { AudioGraphSourceNode, PitchDetectionId } from '../../interfaces';

export interface AudioGraphStateModel {
  paused: boolean;
  suspended: boolean;
  debug: boolean;
  sourceNode: AudioGraphSourceNode;
  delay: number;
  fftSize: number;
  pitch: {
    min: number;
    max: number;
    ZCR: boolean;
    FFTM: boolean;
    FFTP: boolean;
    AC: boolean;
  };
  wave: {
    shape: OscillatorType;
    frequency: number;
  };
  device: {
    id: string;
  };
}

export interface PitchDetectionState {
  id: PitchDetectionId;
  enabled: boolean;
}

export const audioGraphStateDefaults: AudioGraphStateModel = {
  paused: true,
  suspended: true,
  debug: false,
  sourceNode: AudioGraphSourceNode.WAVE,
  delay: 0,
  fftSize: 2048,
  pitch: {
    min: 20,
    max: 20000,
    ZCR: true,
    FFTM: false,
    FFTP: false,
    AC: false,
  },
  wave: {
    shape: 'sine',
    frequency: 440,
  },
  device: {
    id: null,
  },
};

export const AUDIO_GRAPH_STATE_TOKEN = new StateToken<AudioGraphStateModel>(
  'AudioGraph'
);
