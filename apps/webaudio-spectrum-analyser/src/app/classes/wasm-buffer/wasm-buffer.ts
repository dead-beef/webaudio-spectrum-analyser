export class WasmBuffer<T extends TypedArray> {
  public readonly arrayConstructor: TypedArrayConstructor<T> = this.wasm
    .memoryManager.mem[this.type].constructor as any;

  private _ptr: number[] = [];

  private _array: T = new this.arrayConstructor();

  private _wasmMemory: Nullable<ArrayBuffer> = null;

  public get pointer(): number {
    return this._ptr.length ? this._ptr[0] : 0;
  }

  public get length(): number {
    return this._ptr.length;
  }

  public set length(length: number) {
    if (this.length === length) {
      return;
    }
    this.free(this._ptr);
    if (length > 0) {
      this._ptr = this.malloc(length);
    } else {
      this._ptr = [];
    }
    this._wasmMemory = null;
  }

  public get array(): T {
    if (this._wasmMemory !== this.wasm.memory) {
      this._wasmMemory = this.wasm.memory;
      this._array = new this.arrayConstructor(
        this._wasmMemory,
        this.pointer,
        this.length
      );
    }
    return this._array;
  }

  constructor(
    private readonly wasm: WasmModule<any>,
    public readonly type: FilterKeysByType<WasmMemory, T>
  ) {}

  private malloc(length: number): number[] {
    return this.wasm.memoryManager.malloc(length, this.type);
  }

  private free(p: number[]) {
    if (p.length) {
      this.wasm.memoryManager.free(p, this.type);
    }
  }

  public set(src: T) {
    this.length = src.length;
    this.array.set(src);
  }

  public destroy() {
    if (this._ptr.length) {
      this.free(this._ptr);
      this._ptr = [];
    }
  }
}
