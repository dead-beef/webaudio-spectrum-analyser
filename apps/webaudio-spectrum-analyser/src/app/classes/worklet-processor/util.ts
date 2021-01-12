export interface WorkletProcessorStatic {
  readonly key: string;
  readonly inputs: number;
  readonly outputs: number;
  readonly parameterDescriptors: AudioParamDescriptor[];
}

export interface WorkletProcessor /*extends WorkletProcessorStatic*/ {
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: { [key: string]: Float32Array }
  ): boolean;
}

export interface WorkletProcessorConstructor extends WorkletProcessorStatic {
  readonly name: string;
  new (): WorkletProcessor;
}

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
