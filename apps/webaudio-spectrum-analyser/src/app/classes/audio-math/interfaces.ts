export interface WasmBuffer {
  ptr: number[];
  byteLength: number;
  type: WasmMemoryType;
}

export enum FftPeakType {
  MIN_FREQUENCY = 1,
  MAX_PROMINENCE = 2,
}

export enum FftPeakMask {
  NONE = 0,
  CONST = 1,
  LINEAR = 2,
}

export interface PeakDistance {
  histogram: Float32Array;
  median: number;
}

export interface Peaks {
  data: Float32Array;
  count: number;
}

export interface AudioMathWasmFunctions {
  rms: (tdata: number, length: number) => number;

  fftpeaks: (
    fft: number,
    output: number,
    length: number,
    mask: number,
    maskRadius: number
  ) => number;

  autocorr: (
    tdata: number,
    acdata: number,
    length: number,
    minOffset: number,
    maxOffset: number
  ) => void;

  autocorrpeak: (
    acdata: number,
    length: number,
    minOffset: number,
    maxOffset: number
  ) => number;

  prominence: (
    fft: number,
    peaks: number,
    res: number,
    binCount: number,
    peakCount: number,
    start: number,
    end: number,
    radius: number,
    normalize: boolean
  ) => void;

  prominencepeak: (
    pdata: number,
    length: number,
    start: number,
    end: number,
    threshold: number,
    type: number
  ) => number;

  cepstrum: (fft: number, res: number, fftSize: number) => void;

  mpd: (
    fft: number,
    pdHistBuf: number,
    binCount: number,
    peakCount: number
  ) => number;
}
