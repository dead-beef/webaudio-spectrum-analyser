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
  color: string;
  calc: (i: number) => number;
  timeDomain: boolean;
  enabled: boolean;
  values: number[];
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
  worklet: Nullable<AnyScriptNode>;
}

export interface AnyScriptNode extends AudioNode {
  //parameters: AudioParamMap;
  parameters: {
    get: (key: string) => AudioParam;
  };
  port: MessagePort;
}

export interface AudioGraphNodes {
  wave: OscillatorNode;
  element: Nullable<MediaElementAudioSourceNode>;
  device: Nullable<MediaStreamAudioSourceNode>;
  worklet: Nullable<AnyScriptNode>;
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
  WORKLET,
}

export enum FftPeakType {
  MIN_FREQUENCY = 1,
  MAX_MAGNITUDE = 2,
  MAX_PROMINENCE = 3,
}

export interface AudioGraphSource {
  node: AudioGraphSourceNode;
  data?: any;
}

export interface WasmBuffer {
  ptr: number[];
  byteLength: number;
  type: WasmMemoryType;
}

export interface AudioMathWasmFunctions {
  autocorr: (
    tdata: number,
    acdata: number,
    length: number,
    minOffset: number,
    maxOffset: number
  ) => void;

  autocorrpeak: (
    tdata: number,
    acdata: number,
    length: number,
    minOffset: number,
    maxOffset: number
  ) => number;

  prominence: (
    fft: number,
    res: number,
    length: number,
    start: number,
    end: number,
    radius: number,
    fftvalMin: number,
    fftvalMax: number,
    normalize: boolean
  ) => void;

  prominencepeak: (
    fft: number,
    pdata: number,
    length: number,
    start: number,
    end: number,
    radius: number,
    fftvalMin: number,
    fftvalMax: number,
    threshold: number,
    type: number,
    normalize: boolean
  ) => number;
}

export interface Autocorrelation {
  value: Float32Array;
  peak: number;
}

export interface Prominence {
  value: Float32Array;
  peak: number;
}

export enum Layouts {
  VERTICAL = 'vertical',
}
