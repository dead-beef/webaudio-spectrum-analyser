declare interface WasmMemory {
  [1]: Int8Array;
  [2]: Int16Array;
  [4]: Int32Array;
  [40]: Float32Array;
  [80]: Float64Array;
  i8: Int8Array;
  i16: Int16Array;
  i32: Int32Array;
  f32: Float32Array;
  f64: Float64Array;
  char: Int8Array;
  uchar: Uint8Array;
  short: Int16Array;
  ushort: Uint16Array;
  int: Int32Array;
  uint: Uint32Array;
  float: Float32Array;
  double: Float64Array;
}

declare type WasmMemoryType = keyof WasmMemory;

declare interface WasmModule<T> {
  raw: {
    instance: WebAssembly.Instance;
    module: WebAssembly.Module;
  };
  emModule: {
    wasmMemory: WebAssembly.Memory;
    wasmTable: WebAssembly.Table;
    buffer: ArrayBuffer;
  };
  memory: ArrayBuffer;
  memoryManager: {
    allocList: boolean[];
    sizeList: number[];
    max: number;
    mem: WasmMemory;
    malloc: (size: number, type: number | string) => number[];
    free: (addr: number[], type: number | string) => void;
  };
  exports: T & {
    malloc: (size: number) => number;
    stackAlloc: (size: number) => number;
    free: (ptr: number) => void;
  };
}

declare type WasmImports = Record<string, any>;
declare type WasmConfig = (imports: WasmImports) => WasmImports;
declare type WasmModuleFactory<T> = (cfg: WasmConfig) => Promise<WasmModule<T>>;

declare module '*.c' {
  export const init: WasmModuleFactory;
}

declare module '*.cpp' {
  export const init: WasmModuleFactory;
}
