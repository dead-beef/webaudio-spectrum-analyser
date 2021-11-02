export interface WasmBuffer {
  ptr: number[];
  byteLength: number;
  type: WasmMemoryType;
}

export enum FftPeakType {
  MIN_FREQUENCY = 1,
  MAX_PROMINENCE = 2,
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
    pdata: number,
    length: number,
    start: number,
    end: number,
    threshold: number,
    type: number
  ) => number;

  cepstrum: (fft: number, res: number, fftSize: number) => void;
}
