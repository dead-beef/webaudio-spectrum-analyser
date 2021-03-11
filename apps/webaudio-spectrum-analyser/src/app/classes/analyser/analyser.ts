import { AudioMath } from '../audio-math/audio-math';
import { FftPeakType } from '../audio-math/interfaces';
import {
  AnalyserFunction,
  AnalyserFunctionId,
  AnalyserFunctions,
  AnalyserState,
} from './interfaces';

export class Analyser {
  public debug = false;

  public fdata: Float32Array = new Float32Array(1);

  public tdata: Float32Array = new Float32Array(1);

  public hasNan = false;

  public updated = false;

  public canAnalyse = true;

  public stateChanged = false;

  public minPitch = 20;

  public maxPitch = 20000;

  public threshold = 0.2;

  public prominenceRadius = 0;

  public prominenceThreshold = 10;

  public prominenceNormalize = false;

  public fftPeakType: FftPeakType = FftPeakType.MIN_FREQUENCY;

  public minDecibels = -100;

  public maxDecibels = 0;

  public fftSize = 2048;

  public sampleRate = 44100;

  public readonly functionById: AnalyserFunctions = {
    autocorr: {
      id: 'autocorr',
      name: 'Autocorrelation',
      calc: this.autocorr.bind(this),
      enabled: false,
      value: new Float32Array(),
      updated: false,
    },
    prominence: {
      id: 'prominence',
      name: 'FFT peak prominence',
      calc: this.prominence.bind(this),
      enabled: false,
      value: new Float32Array(),
      updated: false,
    },
    cepstrum: {
      id: 'cepstrum',
      name: 'Cepstrum',
      calc: this.cepstrum.bind(this),
      enabled: false,
      value: new Float32Array(),
      updated: false,
    },

    RMS: {
      id: 'RMS',
      name: 'Root mean square',
      calc: this.rms.bind(this),
      enabled: false,
      value: 0,
      updated: false,
    },
    ZCR: {
      id: 'ZCR',
      name: 'Zero-crossing rate',
      calc: this.zcr.bind(this),
      enabled: false,
      value: 0,
      updated: false,
    },
    FFTM: {
      id: 'FFTM',
      name: 'FFT max',
      calc: this.fftmax.bind(this),
      enabled: false,
      value: 0,
      updated: false,
    },
    FFTP: {
      id: 'FFTP',
      name: 'FFT peak',
      calc: this.fftpeak.bind(this),
      enabled: false,
      value: 0,
      updated: false,
    },
    AC: {
      id: 'AC',
      name: 'Autocorrelation peak',
      calc: this.autocorrpeak.bind(this),
      enabled: false,
      value: 0,
      updated: false,
    },
  };

  public readonly functions: AnalyserFunction<any>[] = Object.values(
    this.functionById
  );

  /**
   * Constructor.
   */
  constructor() {}

  /**
   * TODO: description
   */
  public get<K extends AnalyserFunctionId>(
    id: K
  ): Pick<AnalyserFunctions, K>[K]['value'] {
    const fn = this.functionById[id];
    if (fn.updated) {
      return fn.value;
    }
    fn.value = fn.calc(fn.value);
    fn.updated = true;
    return fn.value;
  }

  /**
   * TODO: description
   */
  public getOptional<K extends AnalyserFunctionId>(
    id: K
  ): Nullable<Pick<AnalyserFunctions, K>[K]['value']> {
    const fn = this.functionById[id];
    if (fn.updated) {
      return fn.value;
    }
    return null;
  }

  /**
   * TODO: description
   */
  public getName(id: AnalyserFunctionId): string {
    return this.functionById[id].name;
  }

  /**
   * TODO: description
   */
  public setState(state: AnalyserState) {
    this.stateChanged = true;
    this.debug = state.debug;
    this.minPitch = state.pitch.min;
    this.maxPitch = state.pitch.max;
    this.fftPeakType = state.fftp.type;
    this.prominenceRadius = state.fftp.prominence.radius;
    this.prominenceThreshold = state.fftp.prominence.threshold;
    this.prominenceNormalize = state.fftp.prominence.normalize;
    for (const fn of this.functions) {
      fn.enabled = Boolean(state.functions[fn.id]);
    }
  }

  /**
   * TODO: description
   */
  public clearData(): Analyser {
    this.tdata.fill(0);
    this.fdata.fill(this.minDecibels);
    for (const fn of this.functions) {
      if (typeof fn.value === 'number') {
        fn.value = 0;
      } else if (typeof (fn.value as Array<number>).fill === 'function') {
        (fn.value as Array<number>).fill(0);
      } else {
        console.warn('clear', fn);
      }
      fn.updated = false;
    }
    this.stateChanged = true;
    return this;
  }

  /**
   * TODO: description
   */
  public analyseData(): Analyser {
    if (!this.canAnalyse) {
      return this;
    }
    for (const fn of this.functions) {
      fn.updated = false;
    }
    for (const fn of this.functions) {
      if (fn.enabled) {
        fn.updated = true;
        fn.value = fn.calc(fn.value);
      }
    }
    this.stateChanged = false;
    return this;
  }

  /**
   * TODO: description
   */
  public getData(node: AnalyserNode): Analyser {
    let nan = false;

    this.minDecibels = node.minDecibels;
    this.maxDecibels = node.maxDecibels;
    this.fftSize = node.fftSize;
    this.sampleRate = node.context.sampleRate;

    this.tdata = AudioMath.resize(this.tdata, node.fftSize);
    node.getFloatTimeDomainData(this.tdata);

    this.fdata = AudioMath.resize(this.fdata, node.frequencyBinCount);
    node.getFloatFrequencyData(this.fdata);
    for (let i = 0; i < this.fdata.length; ++i) {
      const db = this.fdata[i];
      if (isNaN(db)) {
        nan = true;
      }
      this.fdata[i] = Math.min(
        Math.max(this.minDecibels, db),
        this.maxDecibels
      );
    }

    const threshold =
      this.minDecibels + this.threshold * (this.maxDecibels - this.minDecibels);
    this.hasNan = nan;
    this.canAnalyse = !this.hasNan && this.fdata.some(f => f > threshold);

    return this;
  }

  /**
   * TODO: description
   */
  public update(paused: boolean, node: AnalyserNode): Analyser {
    if (paused) {
      if (this.stateChanged) {
        this.updated = true;
        this.analyseData();
      } else {
        this.updated = false;
      }
    } else {
      this.updated = true;
      this.getData(node).analyseData();
    }
    return this;
  }

  /**
   * TODO: description
   */
  public indexOfFrequency(f: number): number {
    return Math.round((f * this.fftSize) / this.sampleRate);
  }

  /**
   * TODO: description
   */
  public indexOfQuefrency(q: number): number {
    return Math.round((q * this.sampleRate) / 2);
  }

  /**
   * TODO: description
   */
  public rms(): number {
    return AudioMath.rms(this.tdata);
  }

  /**
   * TODO: description
   */
  public zcr(): number {
    let res: number = AudioMath.zcr(this.tdata);
    res *= this.sampleRate;
    res = AudioMath.clampPitch(res, this.minPitch, this.maxPitch);
    return res;
  }

  /**
   * TODO: description
   */
  public fftmax(): number {
    const fdata = this.fdata;
    const fscale: number = this.fftSize / this.sampleRate;
    const start: number = Math.floor(this.minPitch * fscale);
    const end: number = Math.floor(this.maxPitch * fscale) + 1;
    let res: number = AudioMath.indexOfMax(fdata, start, end);
    if (res > 0 && res < fdata.length - 1) {
      res += AudioMath.interpolatePeak(
        fdata[res],
        fdata[res - 1],
        fdata[res + 1]
      );
    }
    res /= fscale;
    return res;
  }

  /**
   * TODO: description
   */
  public prominence(prev: Float32Array): Float32Array {
    const fdata = this.fdata;
    const fscale: number = this.fftSize / this.sampleRate;
    const start: number = Math.floor(this.minPitch * fscale);
    const end: number = Math.floor(this.maxPitch * fscale) + 1;

    return AudioMath.prominence(
      fdata,
      prev,
      start,
      end,
      this.prominenceRadius,
      this.minDecibels,
      this.maxDecibels,
      this.prominenceNormalize
    );
  }

  /**
   * TODO: description
   */
  public fftpeak(): number {
    const fdata = this.fdata;
    const fscale: number = this.fftSize / this.sampleRate;
    const start: number = Math.floor(this.minPitch * fscale);
    const end: number = Math.floor(this.maxPitch * fscale) + 1;

    let res = AudioMath.prominencepeak(
      this.get('prominence'),
      this.fftPeakType,
      start,
      end,
      this.prominenceThreshold
    );

    if (res > 0 && res < fdata.length - 1) {
      res += AudioMath.interpolatePeak(
        fdata[res],
        fdata[res - 1],
        fdata[res + 1]
      );
    }
    res /= fscale;

    return res;
  }

  /**
   * TODO: description
   */
  public autocorr(prev: Float32Array): Float32Array {
    const start = Math.floor(this.sampleRate / this.maxPitch);
    const end = Math.floor(this.sampleRate / this.minPitch) + 1;
    return AudioMath.autocorr(this.tdata, start, end, prev);
  }

  /**
   * TODO: description
   */
  public autocorrpeak(): number {
    const start = Math.floor(this.sampleRate / this.maxPitch);
    const end = Math.floor(this.sampleRate / this.minPitch) + 1;
    const ac = AudioMath.autocorrpeak(this.get('autocorr'), start, end);
    return this.sampleRate / ac;
  }

  /**
   * TODO: description
   */
  public cepstrum(prev: Float32Array): Float32Array {
    return AudioMath.cepstrum(this.fdata, prev);
  }
}
