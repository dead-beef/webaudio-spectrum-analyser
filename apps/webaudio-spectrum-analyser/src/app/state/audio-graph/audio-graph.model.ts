import { StateToken } from '@ngxs/store';

import {
  AudioGraphFilterNode,
  AudioGraphSourceNode,
  FftPeakType,
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
  overtoneDecay: number;
}

export interface PitchShifterState {
  shift: number;
  bufferTime: number;
}

export interface WorkletFilterState {
  fftSize: number;
  type: number;
  gain: number;
  minPitch: number;
  maxPitch: number;
  minHarmonic: number;
  maxHarmonic: number;
  step: number;
  prominenceThreshold: number;
  fScaleRadius: number;
  harmonicSearchRadius: number;
  smoothScale: boolean;
}

export interface BiquadState {
  type: BiquadFilterType;
  frequency: number;
  detune: number;
  q: number;
  gain: number;
}

export interface FftPeakState {
  type: FftPeakType;
  prominence: {
    radius: number;
    threshold: number;
    normalize: boolean;
  };
}

export interface AudioGraphStateModel {
  paused: boolean;
  suspended: boolean;
  volume: number;
  debug: boolean;
  sourceNode: AudioGraphSourceNode;
  delay: number;
  fftSize: number;
  smoothing: number;
  pitch: {
    min: number;
    max: number;
    ZCR: boolean;
    FFTM: boolean;
    FFTP: boolean;
    AC: boolean;
  };
  fftp: FftPeakState;
  wave: {
    shape: OscillatorType;
    frequency: number;
  };
  device: {
    id: Nullable<string>;
  };
  worklet: {
    type: number;
  };
  filter: {
    id: AudioGraphFilterNode;
    convolver: ConvolverState;
    biquad: BiquadState;
    iir: IirState;
    pitchShifter: PitchShifterState;
    worklet: WorkletFilterState;
  };
}

export const AUDIO_GRAPH_STATE_DEFAULTS: AudioGraphStateModel = {
  paused: true,
  suspended: true,
  volume: 0.5,
  debug: false,
  sourceNode: AudioGraphSourceNode.WAVE,
  delay: 0,
  fftSize: 2048,
  smoothing: 0.5,
  pitch: {
    min: 20,
    max: 20000,
    ZCR: true,
    FFTM: false,
    FFTP: false,
    AC: false,
  },
  fftp: {
    type: FftPeakType.MAX_MAGNITUDE,
    prominence: {
      radius: 0,
      threshold: 0.1,
      normalize: false,
    },
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
      overtoneDecay: 0,
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
    pitchShifter: {
      shift: 0,
      bufferTime: 0.1,
    },
    worklet: {
      fftSize: 4096,
      type: 0,
      gain: 0,
      minPitch: 90,
      maxPitch: 250,
      minHarmonic: 1,
      maxHarmonic: 200,
      step: 2,
      prominenceThreshold: 5,
      fScaleRadius: 60,
      harmonicSearchRadius: 0.3,
      smoothScale: false,
    },
  },
};

export const AUDIO_GRAPH_STATE_TOKEN = new StateToken<AudioGraphStateModel>(
  'AudioGraph'
);
