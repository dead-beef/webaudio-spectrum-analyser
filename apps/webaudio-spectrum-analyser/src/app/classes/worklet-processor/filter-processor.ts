import { AudioParamDescriptor, WorkletFilterParam } from './interfaces';
import { AudioWorkletProcessor } from './util';

export class FilterProcessor extends AudioWorkletProcessor {
  /**
   * TODO: description
   */
  public static get key(): string {
    return 'filter-processor';
  }

  /**
   * TODO: description
   */
  public static get inputs(): number {
    return 1;
  }

  /**
   * TODO: description
   */
  public static get outputs(): number {
    return 1;
  }

  /**
   * TODO: description
   */
  public static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      {
        name: 'fftSize',
        defaultValue: 4096,
        minValue: 128,
        maxValue: 16384,
        automationRate: 'k-rate',
      },
      {
        name: 'type',
        defaultValue: 0,
        minValue: 0,
        automationRate: 'k-rate',
      },
      {
        name: 'gain',
        defaultValue: 0,
        automationRate: 'k-rate',
      },
      {
        name: 'minPitch',
        defaultValue: 90,
        minValue: 20,
        maxValue: 20000,
        automationRate: 'k-rate',
      },
      {
        name: 'maxPitch',
        defaultValue: 250,
        minValue: 20,
        maxValue: 20000,
        automationRate: 'k-rate',
      },
      {
        name: 'minHarmonic',
        defaultValue: 1,
        minValue: 1,
        automationRate: 'k-rate',
      },
      {
        name: 'maxHarmonic',
        defaultValue: 1,
        minValue: 1,
        automationRate: 'k-rate',
      },
      {
        name: 'step',
        defaultValue: 1,
        minValue: 1,
        automationRate: 'k-rate',
      },
      {
        name: 'harmonicGain',
        defaultValue: -100,
        minValue: -100,
        maxValue: 100,
        automationRate: 'k-rate',
      },
      {
        name: 'fScaleRadius',
        defaultValue: 60,
        minValue: 0,
        maxValue: 20000,
        automationRate: 'k-rate',
      },
      {
        name: 'harmonicSearchRadius',
        defaultValue: 0.3,
        minValue: 0,
        maxValue: 1,
        automationRate: 'k-rate',
      },
      {
        name: 'smoothScale',
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
        automationRate: 'k-rate',
      },
    ];
  }

  public readonly blockSize = 128;

  public wasm: Nullable<WebAssembly.Instance> = null;

  public memory: Nullable<WebAssembly.Memory> = null;

  public sampleRate = 0;

  public buffer: {
    input: Float32Array;
    output: Float32Array;
    output2: Float32Array;
  }[] = [];

  public unusedInput = 0;

  public usedOutput = 0;

  private _fftSize = 4096;

  public wasmFilterStart: (
    input: number,
    fft: number,
    fftSize: number
  ) => void = () => {};

  public wasmFilterEnd: (input: number, fft: number, fftSize: number) => void =
    () => {};

  public wasmGain: (fft: number, fftSize: number, gain: number) => void =
    () => {};

  public wasmAddHarmonics: (
    fft: number,
    fftSize: number,
    sampleRate: number,
    minPitch: number,
    maxPitch: number,
    minHarmonic: number,
    maxHarmonic: number,
    step: number,
    fScaleRadius: number,
    harmonicSearchRadius: number,
    smoothScale: number
  ) => void = () => {};

  public wasmScaleHarmonics: (
    fft: number,
    fftSize: number,
    sampleRate: number,
    minPitch: number,
    maxPitch: number,
    minHarmonic: number,
    maxHarmonic: number,
    step: number,
    factor: number,
    fScaleRadius: number,
    harmonicSearchRadius: number,
    smoothScale: number
  ) => void = () => {};

  /**
   * Getter.
   */
  public get fftSize() {
    return this._fftSize;
  }

  /**
   * Setter.
   */
  public set fftSize(size: number) {
    if (size === this._fftSize) {
      return;
    }
    if (size !== Math.round(size)) {
      throw new Error(`invalid fft size: ${size}: not an integer`);
    }
    if (size & (size - 1)) {
      throw new Error(`invalid fft size: ${size}: not a power of 2`);
    }
    if (size % this.blockSize) {
      throw new Error(
        `invalid fft size: ${size}: not a multiple of block size (${size})`
      );
    }
    this.resetBuffers();
    this._fftSize = size;
  }

  /**
   * Constructor.
   */
  constructor() {
    super();

    const port: MessagePort = this['port'];
    if (port) {
      port.onmessage = (ev: MessageEvent) => this.onmessage(ev.data);
    }
  }

  /**
   * TODO: description
   */
  public onmessage(data: Record<string, any>) {
    console.log('onmessage', data);
    if (data.type === 'init') {
      this.sampleRate = data.sampleRate;
      const mod: WebAssembly.Module = data.module;
      const pageSize = 65536;
      const memorySize: number = Math.round(data.memorySize / pageSize);
      const memory = new WebAssembly.Memory({
        initial: memorySize,
        maximum: memorySize,
      });
      const importObj = {
        env: {
          table: new WebAssembly.Table({
            initial: WebAssembly.Module.imports(mod).length,
            maximum: 64,
            //initial: 0,
            //maximum: 0,
            element: 'anyfunc',
          }),
          tableBase: 0,
          memory: memory,
          memoryBase: 1024,
          STACKTOP: 0,
          STACK_MAX: memory.buffer.byteLength,
          ['emscripten_resize_heap']: (...args) => {
            throw new Error('emscripten_resize_heap ' + JSON.stringify(args));
          },
          ['emscripten_memcpy_big']: (...args) => {
            throw new Error('emscripten_memcpy_big ' + JSON.stringify(args));
          },
          segfault: () => {
            throw new Error('segfault');
          },
          alignfault: () => {
            throw new Error('alignfault');
          },
          abort: () => {
            throw new Error('aborted');
          },
        },
      };
      void WebAssembly.instantiate(mod, importObj).then(instance => {
        this.wasm = instance;
        this.memory = memory;
        this.wasmFilterStart = this.wasm.exports.filter_start as any;
        this.wasmFilterEnd = this.wasm.exports.filter_end as any;
        this.wasmGain = this.wasm.exports.gain as any;
        this.wasmAddHarmonics = this.wasm.exports.add_harmonics as any;
        this.wasmScaleHarmonics = this.wasm.exports.scale_harmonics as any;
        console.log('instance', instance);
      });
    }
  }

  /**
   * TODO: description
   */
  public resetBuffers() {
    this.buffer = [];
    this.unusedInput = 0;
    this.usedOutput = 0;
  }

  /**
   * TODO: description
   */
  public copyToMemory(buf: ArrayBuffer, ptr: number) {
    const src = new Uint8Array(buf);
    const dst = new Uint8Array(this.memory!.buffer);
    dst.set(src, ptr);
  }

  /**
   * TODO: description
   */
  public copyFromMemory(buf: ArrayBuffer, ptr: number) {
    const src = new Uint8Array(this.memory!.buffer, ptr, buf.byteLength);
    const dst = new Uint8Array(buf);
    dst.set(src);
  }

  /**
   * TODO: description
   */
  public copy(inputs: Float32Array[][], outputs: Float32Array[][]): void {
    const inputChannels = inputs[0];
    const outputChannels = outputs[0];
    for (let i = 0; i < inputChannels.length; ++i) {
      outputChannels[i].set(inputChannels[i]);
    }
  }

  /**
   * TODO: description
   */
  public output(res: Float32Array, buf: Float32Array, buf2: Float32Array) {
    const offset = this.fftSize / 2;
    for (let i = 0; i < this.blockSize; ++i) {
      const j = this.usedOutput + i;
      res[i] = buf[offset + j] + buf2[j];
    }
  }

  /**
   * TODO: description
   */
  public filter(
    inputPtr: number,
    outputPtr: number,
    fftPtr: number,
    parameters: AudioWorkletProcessorParmeters<WorkletFilterParam>
  ): void {
    const filterType = Math.round(parameters.type[0]);
    this.wasmFilterStart(inputPtr, fftPtr, this.fftSize);
    switch (filterType) {
      case 0:
        break;
      case 1:
        this.wasmScaleHarmonics(
          fftPtr,
          this.fftSize,
          this.sampleRate,
          parameters.minPitch[0],
          parameters.maxPitch[0],
          parameters.minHarmonic[0],
          parameters.maxHarmonic[0],
          parameters.step[0],
          Math.pow(10, parameters.harmonicGain[0] / 20),
          parameters.fScaleRadius[0],
          parameters.harmonicSearchRadius[0],
          parameters.smoothScale[0]
        );
        break;
      case 2:
        this.wasmAddHarmonics(
          fftPtr,
          this.fftSize,
          this.sampleRate,
          parameters.minPitch[0],
          parameters.maxPitch[0],
          parameters.minHarmonic[0],
          parameters.maxHarmonic[0],
          parameters.step[0],
          parameters.fScaleRadius[0],
          parameters.harmonicSearchRadius[0],
          parameters.smoothScale[0]
        );
        break;
      default:
        break;
    }
    this.wasmGain(fftPtr, this.fftSize, parameters.gain[0]);
    this.wasmFilterEnd(outputPtr, fftPtr, this.fftSize);
  }

  /**
   * TODO: description
   */
  public process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: AudioWorkletProcessorParmeters<WorkletFilterParam>
  ): boolean {
    try {
      if (this.wasm === null || this.memory === null) {
        //this.copy(inputs, outputs);
        return true;
      }

      this.fftSize = parameters.fftSize[0];

      let update = false;
      this.unusedInput += this.blockSize;
      if (this.unusedInput >= this.fftSize / 2) {
        update = true;
        this.unusedInput = 0;
      }

      const inputChannels = inputs[0];
      const outputChannels = outputs[0];

      for (let i = 0; i < inputChannels.length; ++i) {
        const inputChannel = inputChannels[i];
        const outputChannel = outputChannels[i];

        if (!this.buffer[i]) {
          this.buffer[i] = {
            input: new Float32Array(this.fftSize),
            output: new Float32Array(this.fftSize),
            output2: new Float32Array(this.fftSize),
          };
        }

        const inputBuffer = this.buffer[i].input;
        const outputBuffer = this.buffer[i].output;
        const outputBuffer2 = this.buffer[i].output2;

        inputBuffer.set(inputBuffer.subarray(this.blockSize));
        inputBuffer
          .subarray(inputBuffer.length - this.blockSize)
          .set(inputChannel);

        if (update) {
          this.output(outputChannel, outputBuffer, outputBuffer2);

          const inputPtr =
            this.memory.buffer.byteLength - inputBuffer.byteLength;
          const outputPtr = inputPtr - outputBuffer.byteLength;
          const fftPtr = outputPtr - 2 * outputBuffer.byteLength;

          this.copyToMemory(inputBuffer.buffer, inputPtr);

          this.filter(inputPtr, outputPtr, fftPtr, parameters);

          outputBuffer.set(outputBuffer2);
          this.copyFromMemory(outputBuffer2.buffer, outputPtr);
        } else {
          this.output(outputChannel, outputBuffer, outputBuffer2);
        }
      }
      if (update) {
        this.usedOutput = 0;
      } else {
        this.usedOutput += this.blockSize;
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
