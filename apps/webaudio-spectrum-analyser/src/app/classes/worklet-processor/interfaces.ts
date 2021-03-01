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

export interface AnyScriptNode extends AudioNode {
  //parameters: AudioParamMap;
  parameters: {
    get: (key: string) => AudioParam;
  };
  port: MessagePort;
}

export enum WorkletFilterType {
  NONE,
  REMOVE_HARMONICS,
  ADD_HARMONICS,
  _MAX_VALUE,
}

export type WorkletFilterParam =
  | 'fftSize'
  | 'type'
  | 'gain'
  | 'minPitch'
  | 'maxPitch'
  | 'minHarmonic'
  | 'maxHarmonic'
  | 'step'
  | 'prominenceThreshold'
  | 'fScaleRadius'
  | 'harmonicSearchRadius'
  | 'smoothScale';

export type WorkletGeneratorParam = 'type';
