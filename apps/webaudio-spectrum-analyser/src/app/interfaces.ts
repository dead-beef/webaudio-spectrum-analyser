export interface Unit {
  prefix: string,
  value: number
}

export interface Point {
  x: number,
  y: number
}

export interface FileData {
  name: string,
  url: string
}

export interface TypedArray {
  readonly BYTES_PER_ELEMENT: number,
  readonly length: number,
  [n: number]: number,

  slice(start?: number, end?: number): TypedArray,
  reduce(callback: (prev: any, cur: any) => any, initial?: number): any,
  fill(value: number): void
};

export interface TypedArrayConstructor<T> {
  BYTES_PER_ELEMENT: number,
  new (): T,
  new (size: number): T,
  new (buffer: ArrayBuffer): T
}


export interface PitchDetection {
  name: string,
  short: string,
  calc: () => number,
  smooth: boolean,
  enabled: boolean,
  value: number
}

export interface AudioGraphNodes {
  wave: OscillatorNode,
  element: MediaElementAudioSourceNode,
  device: MediaStreamAudioSourceNode,
  input: DelayNode,
  analysers: AnalyserNode[],
  output: MediaStreamAudioDestinationNode
}
