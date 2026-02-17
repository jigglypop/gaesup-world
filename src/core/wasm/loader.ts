export type GaesupCoreWasmExports = {
  readonly memory: WebAssembly.Memory;
  readonly alloc_f32: (len: number) => number;
  readonly dealloc_f32: (ptr: number, len: number) => void;
  readonly alloc_u8: (len: number) => number;
  readonly dealloc_u8: (ptr: number, len: number) => void;
  readonly alloc_u32: (len: number) => number;
  readonly dealloc_u32: (ptr: number, len: number) => void;

  // noise.rs
  readonly fill_grass_data: (
    instances: number,
    width: number,
    seed: number,
    offsets_ptr: number,
    orientations_ptr: number,
    stretches_ptr: number,
    half_sin_ptr: number,
    half_cos_ptr: number,
  ) => void;
  readonly fill_terrain_y: (
    count: number,
    xs_ptr: number,
    zs_ptr: number,
    seed: number,
    out_ptr: number,
  ) => void;

  // matrix.rs
  readonly fill_instance_matrices: (
    count: number,
    positions_ptr: number,
    rotations_ptr: number,
    scales_ptr: number,
    out_ptr: number,
  ) => void;
  readonly fill_wall_matrices: (
    count: number,
    positions_ptr: number,
    rotations_ptr: number,
    out_ptr: number,
  ) => void;

  // vector.rs
  readonly batch_smooth_damp: (
    count: number,
    current_ptr: number,
    target_ptr: number,
    velocity_ptr: number,
    smooth_time: number,
    max_speed: number,
    dt: number,
  ) => void;
  readonly batch_quat_slerp: (
    count: number,
    current_ptr: number,
    target_ptr: number,
    alpha: number,
  ) => void;
  readonly batch_sfe_weights: (
    count: number,
    positions_ptr: number,
    camera_x: number,
    camera_y: number,
    camera_z: number,
    near: number,
    far: number,
    strength: number,
    out_ptr: number,
  ) => void;

  // spatial.rs
  readonly spatial_query_nearby: (
    count: number,
    positions_ptr: number,
    query_x: number,
    query_y: number,
    query_z: number,
    radius: number,
    out_indices_ptr: number,
    out_capacity: number,
  ) => number;
  readonly spatial_grid_query: (
    count: number,
    positions_ptr: number,
    cell_size: number,
    query_x: number,
    query_y: number,
    query_z: number,
    radius: number,
    out_indices_ptr: number,
    out_capacity: number,
  ) => number;

  // pathfinding.rs
  readonly astar_find_path: (
    grid_ptr: number,
    grid_width: number,
    grid_height: number,
    start_x: number,
    start_z: number,
    goal_x: number,
    goal_z: number,
    out_path_ptr: number,
    out_capacity: number,
  ) => number;
  readonly astar_find_path_weighted: (
    cost_ptr: number,
    grid_width: number,
    grid_height: number,
    start_x: number,
    start_z: number,
    goal_x: number,
    goal_z: number,
    out_path_ptr: number,
    out_capacity: number,
  ) => number;
};

let wasmPromise: Promise<GaesupCoreWasmExports | null> | null = null;

function getWasmUrl(): string {
  try {
    const maybeEnv = (import.meta as unknown as { env?: { BASE_URL?: unknown } }).env;
    const baseUrl = typeof maybeEnv?.BASE_URL === 'string' ? maybeEnv.BASE_URL : null;
    if (baseUrl) {
      const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      return new URL(`${normalized}wasm/gaesup_core.wasm`, document.baseURI).toString();
    }
    if (typeof document !== 'undefined' && typeof document.baseURI === 'string' && document.baseURI.length > 0) {
      const u = new URL(document.baseURI);
      return `${u.origin}/wasm/gaesup_core.wasm`;
    }
  } catch {
    // ignore
  }
  return '/wasm/gaesup_core.wasm';
}

export async function loadCoreWasm(): Promise<GaesupCoreWasmExports | null> {
  if (typeof WebAssembly === 'undefined') return null;
  if (wasmPromise) return wasmPromise;

  wasmPromise = (async () => {
    try {
      const url = getWasmUrl();
      const res = await fetch(url);
      if (!res.ok) return null;
      const bytes = await res.arrayBuffer();
      const { instance } = await WebAssembly.instantiate(bytes, {});
      const exports = instance.exports as unknown as Partial<GaesupCoreWasmExports>;

      if (!exports || !(exports.memory instanceof WebAssembly.Memory)) return null;
      if (typeof exports.alloc_f32 !== 'function') return null;
      if (typeof exports.dealloc_f32 !== 'function') return null;

      return exports as GaesupCoreWasmExports;
    } catch {
      return null;
    }
  })();

  return wasmPromise;
}

// Helper: allocate, write Float32Array, return pointer.
export function writeF32(wasm: GaesupCoreWasmExports, data: Float32Array): number {
  const ptr = wasm.alloc_f32(data.length);
  new Float32Array(wasm.memory.buffer, ptr, data.length).set(data);
  return ptr;
}

// Helper: read Float32Array from WASM memory (copies out).
export function readF32(wasm: GaesupCoreWasmExports, ptr: number, len: number): Float32Array {
  return new Float32Array(new Float32Array(wasm.memory.buffer, ptr, len));
}

// Helper: allocate, write Uint8Array, return pointer.
export function writeU8(wasm: GaesupCoreWasmExports, data: Uint8Array): number {
  const ptr = wasm.alloc_u8(data.length);
  new Uint8Array(wasm.memory.buffer, ptr, data.length).set(data);
  return ptr;
}

// Helper: read Uint32Array from WASM memory (copies out).
export function readU32(wasm: GaesupCoreWasmExports, ptr: number, len: number): Uint32Array {
  return new Uint32Array(new Uint32Array(wasm.memory.buffer, ptr, len));
}
