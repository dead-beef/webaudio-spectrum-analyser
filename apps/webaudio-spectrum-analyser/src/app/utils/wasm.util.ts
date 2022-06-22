interface WasmInstantiated {
  module: WebAssembly.Module;
  instance: WebAssembly.Instance;
}

type WasmInstantiate = (
  bufferSource: TypedArray | ArrayBuffer,
  importObject?: Record<string, any>
) => Promise<WasmInstantiated>;

type WasmInstantiateStreaming = (
  source: Response | Promise<Response>,
  importObject?: Record<string, any>
) => Promise<WasmInstantiated>;

interface Wasm {
  instantiate: WasmInstantiate;
  instantiateStreaming: WasmInstantiateStreaming;
}

/**
 * TODO: description
 */
class WasmPatcher {
  private _lock: Promise<void> = Promise.resolve();

  private _wasm: Nullable<Wasm> = null;

  public binary: Nullable<Uint8Array> = null;

  private _unlock: () => void = () => {};

  private _wasmInstantiate: WasmInstantiate = () => Promise.reject(new Error());

  private _wasmInstantiateStreaming: WasmInstantiateStreaming = () =>
    Promise.reject(new Error());

  /**
   * TODO: description
   */
  private async lock() {
    await this._lock;
    this._lock = new Promise((resolve, reject) => (this._unlock = resolve));
  }

  /**
   * TODO: description
   */
  private unlock() {
    this._unlock();
    this._unlock = () => {};
  }

  /**
   * TODO: description
   */
  private async instantiate(
    bufferSource: TypedArray | ArrayBuffer,
    importObject?: Record<string, any>
  ): Promise<WasmInstantiated> {
    //console.log('instantiate');
    if (bufferSource instanceof ArrayBuffer) {
      this.binary = new Uint8Array(bufferSource);
    } else {
      this.binary = new Uint8Array(bufferSource.buffer);
    }
    //console.log('binary', this.binary);
    return this._wasmInstantiate.call(this._wasm, bufferSource, importObject);
  }

  /**
   * TODO: description
   */
  private async instantiateStreaming(
    source: Response | Promise<Response>,
    importObject?: Record<string, any>
  ): Promise<WasmInstantiated> {
    //console.log('instantiateStreaming');
    let response: Response;
    if (source instanceof Response) {
      response = source;
    } else {
      response = await source;
    }
    const clonedResponse = response.clone();
    const ret = await this._wasmInstantiateStreaming.call(
      this._wasm,
      response,
      importObject
    );
    //console.log('response', clonedResponse);
    this.binary = new Uint8Array(await clonedResponse.arrayBuffer());
    //console.log('binary', this.binary);
    return ret;
  }

  /**
   * TODO: description
   */
  public async patch(): Promise<void> {
    await this.lock();
    this.binary = null;
    this._wasm = window.WebAssembly;
    if ((this._wasmInstantiate = this._wasm.instantiate)) {
      this._wasm.instantiate = this.instantiate.bind(this);
    }
    if ((this._wasmInstantiateStreaming = this._wasm.instantiateStreaming)) {
      this._wasm.instantiateStreaming = this.instantiateStreaming.bind(this);
    }
  }

  /**
   * TODO: description
   */
  public unpatch(): void {
    this.binary = null;
    this._wasm = null;
    this._wasmInstantiate = () => Promise.reject(new Error());
    this._wasmInstantiateStreaming = () => Promise.reject(new Error());
    this.unlock();
  }
}

export const wasmPatcher = new WasmPatcher();

/**
 * TODO: description
 */
export function fixWasmImports(imports: WasmImports): WasmImports {
  //console.warn('imports', imports);
  imports['emscripten_resize_heap'] = (...args) => {
    console.warn('emscripten_resize_heap', args);
  };
  imports['emscripten_memcpy_big'] = (...args) => {
    console.warn('emscripten_memcpy_big', args);
  };
  imports['segfault'] = () => {
    throw new Error('segfault');
  };
  imports['alignfault'] = () => {
    throw new Error('alignfault');
  };
  imports['abort'] = () => {
    throw new Error('aborted');
  };
  return imports;
}

/**
 * TODO: description
 */
export async function createWasmModule<T>(
  factory: WasmModuleFactory<T>
): Promise<WasmModule<T>> {
  await wasmPatcher.patch();
  try {
    const wasm: WasmModule<T> = await factory((imports: WasmImports) => {
      fixWasmImports(imports);
      return imports;
    });
    wasm.raw.binary = wasmPatcher.binary;
    return wasm;
  } finally {
    wasmPatcher.unpatch();
  }
}
