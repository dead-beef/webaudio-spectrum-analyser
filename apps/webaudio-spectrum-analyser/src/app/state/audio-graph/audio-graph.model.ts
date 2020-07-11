import { StateToken } from '@ngxs/store';

import {
  AudioGraphSourceNode,
  AudioGraphFilterNode,
  PitchDetectionId,
} from '../../interfaces';

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
  filter: {
    id: AudioGraphFilterNode;
    convolver: {
      frequency: number;
    };
    biquad: {
      type: BiquadFilterType;
      frequency: number;
      detune: number;
      q: number;
      gain: number;
    };
    iir: {
      feedforward: number[];
      feedback: number[];
    };
  };
}

export interface PitchDetectionState {
  id: PitchDetectionId;
  enabled: boolean;
}

export interface IirState {
  feedforward: number[];
  feedback: number[];
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
  filter: {
    id: AudioGraphFilterNode.NONE,
    convolver: {
      frequency: 440,
    },
    biquad: {
      type: 'lowpass',
      frequency: 440,
      detune: 0,
      q: 0.5,
      gain: 0,
    },
    iir: {
      feedforward: [1, 0, 0],
      feedback: [1, 0, 0],
    },
  },
};

export const AUDIO_GRAPH_STATE_TOKEN = new StateToken<AudioGraphStateModel>(
  'AudioGraph'
);
