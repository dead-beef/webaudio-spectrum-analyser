import { AudioMath } from '../audio-math/audio-math';
import {
  FftPeakMask,
  FftPeakType,
  PeakDistance,
  Peaks,
} from '../audio-math/interfaces';
import {
  AnalyserFunction,
  AnalyserFunctionDomain as FD,
  AnalyserFunctionId,
  AnalyserFunctions,
  AnalyserNumberFunctionId,
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

  public rmsThreshold = 0;

  public prominenceRadius = 0;

  public prominenceThreshold = 10;

  public prominenceNormalize = false;

  public fftPeakType: FftPeakType = FftPeakType.MIN_FREQUENCY;

  public fftPeakMask: FftPeakMask = FftPeakMask.NONE;

  public fftPeakMaskRadius = 100;

  public minDecibels = -100;

  public maxDecibels = 0;

  public fftSize = 2048;

  public sampleRate = 44100;

  public readonly functionById: AnalyserFunctions = {
    autocorr: this.func(
      'autocorr',
      'Autocorrelation',
      'autocorr',
      FD.OTHER,
      new Float32Array()
    ),
    prominence: this.func(
      'prominence',
      'FFT peak prominence',
      'prominence',
      FD.OTHER,
      new Float32Array()
    ),
    cepstrum: this.func(
      'cepstrum',
      'Cepstrum',
      'cepstrum',
      FD.OTHER,
      new Float32Array()
    ),
    fftPeaks: this.func('fftPeaks', 'FFT peaks', 'fftpeaks', FD.OTHER, {
      data: new Float32Array(),
      count: 0,
    }),
    fftPeakDistance: this.func(
      'fftPeakDistance',
      'FFT peak distane data',
      'fftpd',
      FD.OTHER,
      {
        histogram: new Float32Array(),
        median: 0,
      }
    ),

    RMS: this.func('RMS', 'Root mean square', 'rms', FD.TIME, 0),
    ZCR: this.func('ZCR', 'Zero-crossing rate', 'zcr', FD.FREQUENCY, 0),
    FFTP: this.func('FFTP', 'FFT peak', 'fftpeak', FD.FREQUENCY, 0),
    AC: this.func(
      'AC',
      'Autocorrelation peak',
      'autocorrpeak',
      FD.FREQUENCY,
      0
    ),
    CP: this.func('CP', 'Cepstrum peak', 'cpeak', FD.FREQUENCY, 0),
    MPD: this.func('MPD', 'Median FFT peak distance', 'mpd', FD.FREQUENCY, 0),
  };

  public readonly functions: AnalyserFunction<any>[] = Object.values(
    this.functionById
  );

  public readonly numberFunctionIds: AnalyserNumberFunctionId[] = (
    Object.keys(this.functionById) as AnalyserFunctionId[]
  ).filter(
    id => typeof this.functionById[id].value === 'number'
  ) as AnalyserNumberFunctionId[];

  public readonly FREQUENCY_DOMAIN_FUNCTION_IDS: AnalyserNumberFunctionId[] =
    this.numberFunctionIds.filter(
      id => this.functionById[id].domain === FD.FREQUENCY
    );

  public readonly TIME_DOMAIN_FUNCTION_IDS: AnalyserNumberFunctionId[] =
    this.numberFunctionIds.filter(
      id => this.functionById[id].domain === FD.TIME
    );

  /**
   * Constructor.
   */
  constructor() {}

  /**
   * TODO: description
   */
  private func<T>(
    id: FilterKeysByPropertyType<AnalyserFunctions, 'value', T>,
    name: string,
    calc: MethodOf<Analyser, (prev: T) => T>,
    domain: FD,
    value: T
  ): AnalyserFunction<T> {
    const fn: (prev: T) => T = this[calc] as any;
    return {
      id,
      name,
      domain,
      calc: fn.bind(this),
      enabled: false,
      value,
      updated: false,
    };
  }

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
    fn.value = fn.calc(fn.value as any);
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
    this.rmsThreshold = state.rmsThreshold;
    this.minPitch = state.pitch.min;
    this.maxPitch = state.pitch.max;
    this.fftPeakType = state.fftp.type;
    this.fftPeakMask = state.fftpeaks.mask;
    this.fftPeakMaskRadius = state.fftpeaks.maskRadius;
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
      for (const fn of this.functions) {
        if (typeof fn.value === 'number' && !fn.updated) {
          fn.updated = true;
          fn.value = NaN;
        }
      }
    } else {
      for (const fn of this.functions) {
        if (fn.enabled) {
          fn.updated = true;
          fn.value = fn.calc(fn.value);
        }
      }
    }
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
      } else {
        this.fdata[i] = AudioMath.clamp(db, this.minDecibels, this.maxDecibels);
      }
    }

    this.hasNan = nan;
    this.canAnalyse = !this.hasNan;
    if (this.rmsThreshold > 0) {
      this.canAnalyse = this.canAnalyse && this.get('RMS') > this.rmsThreshold;
    }

    return this;
  }

  /**
   * TODO: description
   */
  public nextFrame(paused: boolean): Analyser {
    this.updated = !paused || this.stateChanged;
    this.stateChanged = false;
    if (this.updated) {
      for (const fn of this.functions) {
        fn.updated = false;
      }
    }
    return this;
  }

  /**
   * TODO: description
   */
  public update(paused: boolean, node: AnalyserNode): Analyser {
    this.nextFrame(paused);
    if (!paused) {
      this.getData(node);
    }
    if (this.updated) {
      this.analyseData();
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
  public frequencyOfIndex(i: number): number {
    return (i * this.sampleRate) / this.fftSize;
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
  public quefrencyOfIndex(i: number): number {
    return (i * 2) / this.sampleRate;
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
  public prominence(prev: Float32Array): Float32Array {
    const start: number = this.indexOfFrequency(this.minPitch);
    const end: number = this.indexOfFrequency(this.maxPitch);
    return AudioMath.prominence(
      this.fdata,
      this.get('fftPeaks'),
      prev,
      start,
      end,
      this.prominenceRadius,
      this.prominenceNormalize
    );
  }

  /**
   * TODO: description
   */
  public fftpeak(): number {
    const start: number = this.indexOfFrequency(this.minPitch);
    const end: number = this.indexOfFrequency(this.maxPitch);
    let res = AudioMath.prominencepeak(
      this.get('prominence'),
      this.fftPeakType,
      start,
      end,
      this.prominenceThreshold
    );
    res = AudioMath.interpolatePeak(this.fdata, res);
    return this.frequencyOfIndex(res);
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

  /**
   * TODO: description
   */
  public cpeak(): number {
    const cdata = this.get('cepstrum');
    const start: number = this.indexOfQuefrency(1 / this.maxPitch);
    const end: number = this.indexOfQuefrency(1 / this.minPitch);
    let res = AudioMath.indexOfMaxPeak(cdata, start, end);
    //console.log('cpeak', start, end, res);
    res = AudioMath.interpolatePeak(cdata, res);
    return 1 / this.quefrencyOfIndex(res);
  }

  /**
   * TODO: description
   */
  public fftpeaks(prev: Peaks): Peaks {
    const r = (this.fftPeakMaskRadius * this.fftSize) / this.sampleRate;
    return AudioMath.fftpeaks(this.fdata, prev, this.fftPeakMask, r);
  }

  /**
   * TODO: description
   */
  public fftpd(prev: PeakDistance): PeakDistance {
    return AudioMath.mpd(this.get('fftPeaks'), prev);
  }

  /**
   * TODO: description
   */
  public mpd(): number {
    return this.frequencyOfIndex(this.get('fftPeakDistance').median);
  }
}
