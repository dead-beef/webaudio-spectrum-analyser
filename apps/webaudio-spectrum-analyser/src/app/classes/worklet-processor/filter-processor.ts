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
    return [];
  }

  public wasm: Nullable<WebAssembly.Instance> = null;

  public memory: Nullable<WebAssembly.Memory> = null;

  public readonly fftSize = 8192;

  public sampleRate = 8192;

  public inputBuffer: Float32Array[] = [];

  public wasmFilter: (
    input: number,
    output: number,
    inputSize: number,
    outputSize: number,
    sampleRate: number
  ) => void = () => {};

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
            initial: 0,
            maximum: 0,
            element: 'anyfunc',
          }),
          tableBase: 0,
          memory: memory,
          memoryBase: 1024,
          STACKTOP: 0,
          STACK_MAX: memory.buffer.byteLength,
          ['emscripten_resize_heap']: (...args) => {
            console.warn('emscripten_resize_heap', args);
          },
          ['emscripten_memcpy_big']: (...args) => {
            console.warn('emscripten_memcpy_big', args);
          },
          segfault: () => {
            throw new Error('segfault');
          },
          alignfault: () => {
            throw new Error('alignfault');
          },
        },
      };
      void WebAssembly.instantiate(mod, importObj).then(instance => {
        this.wasm = instance;
        this.memory = memory;
        this.wasmFilter = this.wasm.exports.filter as any;
        console.log('instance', instance);
      });
    }
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
    for (let j = 0; j < inputChannels.length; ++j) {
      const inputChannel = inputChannels[j];
      const outputChannel = outputChannels[j];
      for (let k = 0; k < inputChannel.length; ++k) {
        outputChannel[k] = inputChannel[k];
      }
    }
  }

  /**
   * TODO: description
   */
  public process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: { [key: string]: Float32Array }
  ): boolean {
    try {
      if (this.wasm === null || this.memory === null) {
        this.copy(inputs, outputs);
      } else {
        const inputChannels = inputs[0];
        const outputChannels = outputs[0];

        for (let i = 0; i < inputChannels.length; ++i) {
          const inputChannel = inputChannels[i];
          const outputChannel = outputChannels[i];

          const inputLength = inputChannel.length;
          const bufSize = 2 * this.fftSize;
          if (!this.inputBuffer[i]) {
            this.inputBuffer[i] = new Float32Array(bufSize);
          }
          const buf = this.inputBuffer[i];

          buf.set(buf.subarray(2 * inputLength));
          const bufOffset = bufSize - 2 * inputLength;
          for (let j = 0; j < inputLength; ++j) {
            buf[bufOffset + 2 * j] = inputChannel[j];
          }

          const inputPtr = this.memory.buffer.byteLength - buf.byteLength;
          const outputPtr = inputPtr - outputChannel.byteLength;

          this.copyToMemory(buf.buffer, inputPtr);
          this.wasmFilter(
            inputPtr,
            outputPtr,
            this.fftSize,
            outputChannel.length,
            this.sampleRate
          );
          this.copyFromMemory(outputChannel.buffer, outputPtr);
        }
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
