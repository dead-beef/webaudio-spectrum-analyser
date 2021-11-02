declare interface TypedArray extends ArrayLike<number> {
  readonly BYTES_PER_ELEMENT: number;
  readonly length: number;
  [n: number]: number;

  slice(start?: number, end?: number): TypedArray;
  reduce(callback: (prev: any, cur: any) => any, initial?: number): any;
  fill(value: number): void;
  set(array: ArrayLike<number>, offset?: number): void;
}

declare interface TypedArrayConstructor<T> {
  BYTES_PER_ELEMENT: number;
  new (): T;
  new (size: number): T;
  new (buffer: ArrayBuffer, byteOffset?: number, length?: number): T;
}

declare type MethodOf<T, M = (...args: any[]) => any> = {
  [P in keyof T]-?: T[P] extends M ? P : never;
}[keyof T];

declare type FilterKeysByPropertyType<T, P extends keyof T[keyof T], V> = {
  [K in keyof T]-?: T[K][P] extends V ? K : never;
}[keyof T];

declare type Nullable<T> = T | null;

declare type Optional<T> = T | null | undefined;

declare type AnyError = Error | MediaError | string;

declare type AudioWorkletProcessorParmeters<T extends string> = {
  [key in T]: Float32Array;
};
