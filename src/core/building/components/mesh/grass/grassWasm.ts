export type GrassOrientationData = {
  orientations: Float32Array;
  stretches: Float32Array;
  halfRootAngleSin: Float32Array;
  halfRootAngleCos: Float32Array;
};

type GrassWasmExports = {
  readonly memory: WebAssembly.Memory;
  readonly alloc_f32: (len: number) => number;
  readonly dealloc_f32: (ptr: number, len: number) => void;
  readonly fill_orientation_data: (
    instances: number,
    seed: number,
    orientationsPtr: number,
    stretchesPtr: number,
    halfRootAngleSinPtr: number,
    halfRootAngleCosPtr: number,
  ) => void;
};

let wasmPromise: Promise<GrassWasmExports | null> | null = null;

const getDefaultWasmUrl = (): string => {
  // Works with <base href="..."> and subpath deployments.
  try {
    // Prefer Vite's configured base URL when available.
    const maybeEnv = (import.meta as unknown as { env?: { BASE_URL?: unknown } }).env;
    const baseUrl = typeof maybeEnv?.BASE_URL === 'string' ? maybeEnv.BASE_URL : null;
    if (baseUrl) {
      const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      return new URL(`${normalized}wasm/gaesup_grass_attr.wasm`, document.baseURI).toString();
    }

    if (typeof document !== 'undefined' && typeof document.baseURI === 'string' && document.baseURI.length > 0) {
      // Use an absolute path to avoid inheriting the current route path.
      const u = new URL(document.baseURI);
      return `${u.origin}/wasm/gaesup_grass_attr.wasm`;
    }
  } catch {
    // ignore
  }
  return '/wasm/gaesup_grass_attr.wasm';
};

export async function loadGrassWasm(): Promise<GrassWasmExports | null> {
  if (typeof WebAssembly === 'undefined') return null;
  if (wasmPromise) return wasmPromise;

  wasmPromise = (async () => {
    try {
      const url = getDefaultWasmUrl();
      const res = await fetch(url);
      if (!res.ok) return null;

      const bytes = await res.arrayBuffer();
      const { instance } = await WebAssembly.instantiate(bytes, {});
      const exports = instance.exports as unknown as Partial<GrassWasmExports>;

      if (!exports || !(exports.memory instanceof WebAssembly.Memory)) return null;
      if (typeof exports.alloc_f32 !== 'function') return null;
      if (typeof exports.dealloc_f32 !== 'function') return null;
      if (typeof exports.fill_orientation_data !== 'function') return null;

      return exports as GrassWasmExports;
    } catch {
      return null;
    }
  })();

  return wasmPromise;
}

export async function generateGrassOrientationDataWasm(
  instances: number,
  seed: number,
): Promise<GrassOrientationData | null> {
  if (!Number.isFinite(instances) || instances <= 0) return null;
  const wasm = await loadGrassWasm();
  if (!wasm) return null;

  const count = instances | 0;
  const seedU32 = seed >>> 0;

  const orientationsLen = count * 4;
  const stretchesLen = count;
  const halfLen = count;

  // Allocate all buffers first to avoid memory buffer swaps in between.
  const orientationsPtr = wasm.alloc_f32(orientationsLen);
  const stretchesPtr = wasm.alloc_f32(stretchesLen);
  const halfSinPtr = wasm.alloc_f32(halfLen);
  const halfCosPtr = wasm.alloc_f32(halfLen);

  try {
    wasm.fill_orientation_data(count, seedU32, orientationsPtr, stretchesPtr, halfSinPtr, halfCosPtr);

    const buffer = wasm.memory.buffer;
    const orientationsView = new Float32Array(buffer, orientationsPtr, orientationsLen);
    const stretchesView = new Float32Array(buffer, stretchesPtr, stretchesLen);
    const halfSinView = new Float32Array(buffer, halfSinPtr, halfLen);
    const halfCosView = new Float32Array(buffer, halfCosPtr, halfLen);

    // Copy out into JS heap so Three can safely hold onto the arrays.
    const orientations = new Float32Array(orientationsView);
    const stretches = new Float32Array(stretchesView);
    const halfRootAngleSin = new Float32Array(halfSinView);
    const halfRootAngleCos = new Float32Array(halfCosView);

    return { orientations, stretches, halfRootAngleSin, halfRootAngleCos };
  } finally {
    wasm.dealloc_f32(orientationsPtr, orientationsLen);
    wasm.dealloc_f32(stretchesPtr, stretchesLen);
    wasm.dealloc_f32(halfSinPtr, halfLen);
    wasm.dealloc_f32(halfCosPtr, halfLen);
  }
}

