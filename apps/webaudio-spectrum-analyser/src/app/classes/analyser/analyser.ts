import { AudioMath } from '../audio-math/audio-math';
import { FftPeakType } from '../audio-math/interfaces';
import {
  AnalyserFunction,
  AnalyserFunctionId,
  AnalyserState,
} from './interfaces';

export class Analyser {
  public debug = false;

  public fdata: Float32Array = new Float32Array(1);

  public tdata: Float32Array = new Float32Array(1);

  public autocorrdata: Float32Array = new Float32Array(1);

  public prominenceData: Float32Array = new Float32Array(1);

  public hasNan = false;

  public updated = false;

  public canAnalyse = true;

  public stateChanged = false;

  public minPitch = 20;

  public maxPitch = 20000;

  public threshold = 0.2;

  public prominenceRadius = 0;

  public prominenceThreshold = 0.1;

  public prominenceNormalize = false;

  public fftPeakType: FftPeakType = FftPeakType.MAX_MAGNITUDE;

  public minDecibels = -100;

  public maxDecibels = 0;

  public fftSize = 2048;

  public sampleRate = 44100;

  public readonly functions: AnalyserFunction[] = [
    {
      id: 'RMS',
      name: 'Root mean square',
      calc: this.rms.bind(this),
      timeDomain: true,
      enabled: false,
      value: 0,
    },
    {
      id: 'ZCR',
      name: 'Zero-crossing rate',
      calc: this.zcr.bind(this),
      timeDomain: false,
      enabled: false,
      value: 0,
    },
    {
      id: 'FFTM',
      name: 'FFT max',
      calc: this.fftmax.bind(this),
      timeDomain: false,
      enabled: false,
      value: 0,
    },
    {
      id: 'FFTP',
      name: 'FFT peak',
      calc: this.fftpeak.bind(this),
      timeDomain: false,
      enabled: false,
      value: 0,
    },
    {
      id: 'AC',
      name: 'Autocorrelation',
      calc: this.autocorr.bind(this),
      timeDomain: false,
      enabled: false,
      value: 0,
    },
  ];

  public readonly functionById: Record<
    AnalyserFunctionId,
    AnalyserFunction
  > = Object.fromEntries(this.functions.map(f => [f.id, f])) as any;

  /**
   * Constructor.
   */
  constructor() {}

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
      fn.enabled = state.functions[fn.id];
    }
  }

  /**
   * TODO: description
   */
  public clearData(): Analyser {
    this.tdata.fill(0);
    this.fdata.fill(this.minDecibels);
    this.autocorrdata.fill(0);
    this.prominenceData.fill(0);
    for (const fn of this.functions) {
      fn.value = 0;
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
      if (fn.enabled) {
        fn.value = fn.calc();
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
   * @param f
   */
  public indexOfFrequency(f: number): number {
    return Math.round((f * this.fftSize) / this.sampleRate);
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
  public fftpeak(): number {
    const fdata = this.fdata;
    const fscale: number = this.fftSize / this.sampleRate;
    const start: number = Math.floor(this.minPitch * fscale);
    const end: number = Math.floor(this.maxPitch * fscale) + 1;

    const prominence = AudioMath.prominence(
      fdata,
      this.prominenceData,
      this.fftPeakType,
      start,
      end,
      this.prominenceRadius,
      this.minDecibels,
      this.maxDecibels,
      this.prominenceThreshold,
      this.prominenceNormalize
    );

    this.prominenceData = prominence.value;
    let res: number = prominence.peak;

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
  public autocorr(): number {
    const start = Math.floor(this.sampleRate / this.maxPitch);
    const end = Math.floor(this.sampleRate / this.minPitch) + 1;
    const ac = AudioMath.autocorrelation(
      this.tdata,
      start,
      end,
      this.autocorrdata
    );
    this.autocorrdata = ac.value;
    return this.sampleRate / ac.peak;
  }
}
