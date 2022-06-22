import { AudioParamDescriptor, WorkletProcessor } from './interfaces';

export class AudioWorkletProcessor implements WorkletProcessor {
  /**
   * TODO: description
   */
  public static get key(): string {
    return 'worklet-processor';
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

  public readonly port: MessagePort = {
    start: () => {},
    close: () => {},
    postMessage: () => {},
    onmessage: () => {},
    onmessageerror: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  };

  /**
   * TODO: description
   */
  public process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: { [key: string]: Float32Array }
  ): boolean {
    return false;
  }
}
