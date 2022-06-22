import { AudioMath } from '../audio-math/audio-math';
import {
  FftPeakMask,
  FftPeakType,
  PeakDistance,
  Peaks,
} from '../audio-math/interfaces';
import { WasmBuffer } from '../wasm-buffer/wasm-buffer';
import {
  AnalyserFunction,
  AnalyserFunctionId,
  AnalyserFunctions,
  AnalyserNumberFunctionId,
  AnalyserState,
  NumberUnitType,
  UnitType as U,
} from './interfaces';

export class Analyser {
  public math = AudioMath.get();

  public debug = false;

  public fdata: WasmBuffer<Float32Array> =
    this.math.createBuffer<Float32Array>('f32');

  public tdata: WasmBuffer<Float32Array> =
    this.math.createBuffer<Float32Array>('f32');

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

  public harmonicSearchRadius = 0.3;

  public maxF0Range = 0.3;

  public minDecibels = -100;

  public maxDecibels = 0;

  public fftSize = 2048;

  public sampleRate = 44100;

  public readonly functionById: AnalyserFunctions = {
    autocorr: this.func(
      'autocorr',
      'Autocorrelation',
      'autocorr',
      U.OTHER,
      this.math.createBuffer<Float32Array>('f32')
    ),
    prominence: this.func(
      'prominence',
      'FFT peak prominence',
      'prominence',
      U.OTHER,
      this.math.createBuffer<Float32Array>('f32')
    ),
    cepstrum: this.func(
      'cepstrum',
      'Cepstrum',
      'cepstrum',
      U.OTHER,
      this.math.createBuffer<Float32Array>('f32')
    ),
    fftPeaks: this.func('fftPeaks', 'FFT peaks', 'fftpeaks', U.OTHER, {
      data: this.math.createBuffer<Float32Array>('f32'),
      count: 0,
    }),
    fftPeakDistance: this.func(
      'fftPeakDistance',
      'FFT peak distane data',
      'fftpd',
      U.OTHER,
      {
        histogram: this.math.createBuffer<Float32Array>('f32'),
        median: 0,
      }
    ),
    fftHarmonics: this.func(
      'fftHarmonics',
      'FFT harmonics',
      'harmonics',
      U.OTHER,
      {
        data: this.math.createBuffer<Float32Array>('f32'),
        count: 0,
      }
    ),

    RMS: this.func('RMS', 'Root mean square', 'rms', U.NUMBER, 0),
    ZCR: this.func('ZCR', 'Zero-crossing rate', 'zcr', U.FREQUENCY, 0),
    FFTP: this.func('FFTP', 'FFT peak', 'fftpeak', U.FREQUENCY, 0),
    AC: this.func('AC', 'Autocorrelation peak', 'autocorrpeak', U.FREQUENCY, 0),
    CP: this.func('CP', 'Cepstrum peak', 'cpeak', U.FREQUENCY, 0),
    MPD: this.func('MPD', 'Median FFT peak distance', 'mpd', U.FREQUENCY, 0),
    F0: this.func('F0', 'Fundamental frequency', 'f0', U.FREQUENCY, 0),
  };

  public readonly functions: AnalyserFunction<any>[] = Object.values(
    this.functionById
  );

  public readonly PITCH_DETECTION_FUNCTION_IDS: AnalyserNumberFunctionId[] = [
    'ZCR',
    'AC',
    'CP',
    'MPD',
    'FFTP',
  ];

  public readonly PITCH_DETECTION_FUNCTION_DEFAULT: AnalyserNumberFunctionId =
    'FFTP';

  public readonly TIME_DOMAIN_FUNCTION_IDS: AnalyserNumberFunctionId[] = [
    'RMS',
  ];

  public readonly FREQUENCY_DOMAIN_FUNCTION_IDS: AnalyserNumberFunctionId[] = [
    ...this.PITCH_DETECTION_FUNCTION_IDS,
    //'F0',
  ];

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
    unit: T extends number ? NumberUnitType : U,
    value: T
  ): AnalyserFunction<T> {
    const fn: (prev: T) => T = this[calc] as any;
    return {
      id,
      name,
      unit,
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
    this.harmonicSearchRadius = state.harmonicSearchRadius;
    for (const fn of this.functions) {
      fn.enabled = Boolean(state.functions[fn.id]);
    }
  }

  /**
   * TODO: description
   */
  public clearData(): Analyser {
    this.tdata.array.fill(0);
    this.fdata.array.fill(this.minDecibels);
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

    this.tdata.length = node.fftSize;
    node.getFloatTimeDomainData(this.tdata.array);

    this.fdata.length = node.frequencyBinCount;
    const fdata = this.fdata.array;
    node.getFloatFrequencyData(fdata);
    for (let i = 0; i < fdata.length; ++i) {
      const db = fdata[i];
      if (isNaN(db)) {
        nan = true;
      } else {
        fdata[i] = this.math.clamp(db, this.minDecibels, this.maxDecibels);
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
    return this.math.rms(this.tdata);
  }

  /**
   * TODO: description
   */
  public zcr(): number {
    let res: number = this.math.zcr(this.tdata.array);
    res *= this.sampleRate;
    res = this.math.clampPitch(res, this.minPitch, this.maxPitch);
    return res;
  }

  /**
   * TODO: description
   */
  public prominence(prev: WasmBuffer<Float32Array>): WasmBuffer<Float32Array> {
    const start: number = this.indexOfFrequency(this.minPitch);
    const end: number = this.indexOfFrequency(this.maxPitch);
    this.math.prominence(
      this.fdata,
      this.get('fftPeaks'),
      prev,
      start,
      end,
      this.prominenceRadius,
      this.prominenceNormalize
    );
    return prev;
  }

  /**
   * TODO: description
   */
  public fftpeak(): number {
    const start: number = this.indexOfFrequency(this.minPitch);
    const end: number = this.indexOfFrequency(this.maxPitch);
    let res = this.math.prominencepeak(
      this.get('prominence'),
      this.fftPeakType,
      start,
      end,
      this.prominenceThreshold
    );
    res = this.math.interpolatePeak(this.fdata.array, res);
    return this.frequencyOfIndex(res);
  }

  /**
   * TODO: description
   */
  public autocorr(prev: WasmBuffer<Float32Array>): WasmBuffer<Float32Array> {
    const start = Math.floor(this.sampleRate / this.maxPitch);
    const end = Math.floor(this.sampleRate / this.minPitch) + 1;
    this.math.autocorr(this.tdata, start, end, prev);
    return prev;
  }

  /**
   * TODO: description
   */
  public autocorrpeak(): number {
    const start = Math.floor(this.sampleRate / this.maxPitch);
    const end = Math.floor(this.sampleRate / this.minPitch) + 1;
    const ac = this.math.autocorrpeak(this.get('autocorr'), start, end);
    return this.sampleRate / ac;
  }

  /**
   * TODO: description
   */
  public cepstrum(prev: WasmBuffer<Float32Array>): WasmBuffer<Float32Array> {
    this.math.cepstrum(this.fdata, prev);
    return prev;
  }

  /**
   * TODO: description
   */
  public cpeak(): number {
    const cdata = this.get('cepstrum');
    const start: number = this.indexOfQuefrency(1 / this.maxPitch);
    const end: number = this.indexOfQuefrency(1 / this.minPitch);
    let res = this.math.indexOfMaxPeak(cdata.array, start, end);
    //console.log('cpeak', start, end, res);
    res = this.math.interpolatePeak(cdata.array, res);
    return 1 / this.quefrencyOfIndex(res);
  }

  /**
   * TODO: description
   */
  public fftpeaks(prev: Peaks): Peaks {
    const r = (this.fftPeakMaskRadius * this.fftSize) / this.sampleRate;
    this.math.fftpeaks(this.fdata, prev, this.fftPeakMask, r);
    return prev;
  }

  /**
   * TODO: description
   */
  public fftpd(prev: PeakDistance): PeakDistance {
    this.math.mpd(this.get('fftPeaks'), prev);
    return prev;
  }

  /**
   * TODO: description
   */
  public harmonics(prev: Peaks): Peaks {
    const f0 = this.get('F0');
    if (isNaN(f0)) {
      prev.count = 0;
      return prev;
    }
    this.math.fftharmonics(
      (f0 * this.fftSize) / this.sampleRate,
      this.get('fftPeaks'),
      prev,
      this.harmonicSearchRadius
    );
    return prev;
  }

  /**
   * TODO: description
   */
  public mpd(): number {
    return this.frequencyOfIndex(this.get('fftPeakDistance').median);
  }

  /**
   * TODO: description
   */
  public f0(): number {
    const values: number[] = [];
    for (const fn of this.PITCH_DETECTION_FUNCTION_IDS) {
      const val = this.getOptional(fn);
      if (val !== null && !isNaN(val)) {
        values.push(val);
      }
    }
    if (!values.length) {
      return this.get(this.PITCH_DETECTION_FUNCTION_DEFAULT);
    }
    return this.math.f0(values, this.maxF0Range);
  }
}
