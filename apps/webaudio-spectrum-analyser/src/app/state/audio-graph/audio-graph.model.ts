import { StateToken } from '@ngxs/store';

import {
  AudioGraphFilterNode,
  AudioGraphSourceNode,
  PitchDetectionId,
} from '../../interfaces';

export interface PitchDetectionState {
  id: PitchDetectionId;
  enabled: boolean;
}

export interface IirState {
  feedforward: number[];
  feedback: number[];
}

export interface ConvolverState {
  duration: number;
  decay: number;
  frequency: number;
  overtones: number;
}

export interface BiquadState {
  type: BiquadFilterType;
  frequency: number;
  detune: number;
  q: number;
  gain: number;
}

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
  worklet: {
    type: number;
  };
  filter: {
    id: AudioGraphFilterNode;
    convolver: ConvolverState;
    biquad: BiquadState;
    iir: IirState;
  };
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
  worklet: {
    type: 0,
  },
  filter: {
    id: AudioGraphFilterNode.NONE,
    convolver: {
      duration: 0.5,
      decay: 1,
      frequency: 440,
      overtones: 0,
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
