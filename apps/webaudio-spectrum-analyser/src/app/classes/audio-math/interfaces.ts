export interface WasmBuffer {
  ptr: number[];
  byteLength: number;
  type: WasmMemoryType;
}

export interface Autocorrelation {
  value: Float32Array;
  peak: number;
}

export interface Prominence {
  value: Float32Array;
  peak: number;
}

export enum FftPeakType {
  MIN_FREQUENCY = 1,
  MAX_MAGNITUDE = 2,
  MAX_PROMINENCE = 3,
}

export interface AudioMathWasmFunctions {
  rms: (tdata: number, length: number) => number;

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
