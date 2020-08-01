export interface Unit {
  prefix: string;
  value: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface FileData {
  name: string;
  url: string;
}

export interface TypedArray {
  readonly BYTES_PER_ELEMENT: number;
  readonly length: number;
  [n: number]: number;

  slice(start?: number, end?: number): TypedArray;
  reduce(callback: (prev: any, cur: any) => any, initial?: number): any;
  fill(value: number): void;
}

export interface TypedArrayConstructor<T> {
  BYTES_PER_ELEMENT: number;
  new (): T;
  new (size: number): T;
  new (buffer: ArrayBuffer): T;
}

export type MethodOf<T> = {
  [P in keyof T]-?: T[P] extends (...args: any[]) => any ? P : never;
}[keyof T];

export interface Stats {
  dom: HTMLElement;
  update: () => void;
  begin: () => void;
  end: () => void;
}

export type PitchDetectionId = 'ZCR' | 'FFTM' | 'FFTP' | 'AC';

export interface PitchDetection {
  name: string;
  short: PitchDetectionId;
  calc: () => number;
  smooth: boolean;
  enabled: boolean;
  value: number;
}

export interface IPitchShifterNode extends GainNode {
  shift: number;
  bufferTime: number;
}

export interface AudioGraphFilters {
  iir: IIRFilterNode;
  biquad: BiquadFilterNode;
  convolver: ConvolverNode;
  pitchShifter: IPitchShifterNode;
}

export interface AnyScriptNode extends AudioNode {
  //parameters: AudioParamMap;
  parameters: {
    get: (key: string) => AudioParam;
  };
}

export interface AudioGraphNodes {
  wave: OscillatorNode;
  element: MediaElementAudioSourceNode;
  device: MediaStreamAudioSourceNode;
  worklet: AnyScriptNode;
  input: DelayNode;
  filter: AudioGraphFilters;
  filteredInput: GainNode;
  analysers: AnalyserNode[];
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
}

export interface AudioGraphSource {
  node: AudioGraphSourceNode;
  data?: any;
}
