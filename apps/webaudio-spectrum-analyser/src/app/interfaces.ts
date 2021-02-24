export * from './classes/audio-graph/interfaces';
export * from './classes/audio-math/interfaces';
export * from './classes/pitch-shifter-node/interfaces';
export * from './classes/worklet-processor/interfaces';
export * from './state/audio-graph-ui/interfaces';

export interface Unit {
  prefix: string;
  value: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface FileData {
  name: string;
  url: string;
}

export interface Stats {
  dom: HTMLElement;
  update: () => void;
  begin: () => void;
  end: () => void;
}

export enum Layouts {
  VERTICAL = 'vertical',
}
