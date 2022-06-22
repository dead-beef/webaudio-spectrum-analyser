import { WasmBuffer } from './wasm-buffer';

describe('WasmBuffer', () => {
  it('should create an instance', () => {
    const arr = new Float32Array(10);
    const wasm: WasmModule<void> = {
      memory: arr.buffer,
      memoryManager: {
        mem: {
          f32: arr,
        },
        malloc: (l, t) => 0,
        free: (p, t) => {},
      },
    } as any;
    expect(new WasmBuffer(wasm, 'f32')).toBeTruthy();
  });
});
