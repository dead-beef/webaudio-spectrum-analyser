import { FftPeakType } from '../audio-math/interfaces';
import { IPitchShifterNode } from '../pitch-shifter-node/interfaces';
import { AnyScriptNode } from '../worklet-processor';

export type PitchDetectionId = 'ZCR' | 'FFTM' | 'FFTP' | 'AC';

export interface PitchDetection {
  id: PitchDetectionId;
  name: string;
  calc: () => number;
  timeDomain: boolean;
  enabled: boolean;
  value: number;
}

export interface AudioGraphFilters {
  iir: IIRFilterNode;
  biquad: BiquadFilterNode;
  convolver: ConvolverNode;
  pitchShifter: IPitchShifterNode;
  worklet: Nullable<AnyScriptNode>;
}

export interface AudioGraphNodes {
  wave: OscillatorNode;
  element: Nullable<MediaElementAudioSourceNode>;
  device: Nullable<MediaStreamAudioSourceNode>;
  worklet: Nullable<AnyScriptNode>;
  input: DelayNode;
  filter: AudioGraphFilters;
  filteredInput: GainNode;
  analyser: AnalyserNode;
  output: MediaStreamAudioDestinationNode;
}

export enum AudioGraphSourceNode {
  WAVE,
  FILE,
  DEVICE,
  WORKLET,
}

export enum AudioGraphFilterNode {
  NONE,
  IIR,
  BIQUAD,
  CONVOLVER,
  PITCH_SHIFTER,
  WORKLET,
}

export interface AudioGraphSource {
  node: AudioGraphSourceNode;
  data?: any;
}

export type AudioGraphUpdateHandler = (
  updated: boolean,
  analysed: boolean
) => any;

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

export interface AudioGraphState {
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
