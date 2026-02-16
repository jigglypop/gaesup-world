import fs from 'fs';
import path from 'path';

type GrassWasmExports = {
  memory: WebAssembly.Memory;
  alloc_f32: (len: number) => number;
  dealloc_f32: (ptr: number, len: number) => void;
  fill_orientation_data: (
    instances: number,
    seed: number,
    orientationsPtr: number,
    stretchesPtr: number,
    halfRootAngleSinPtr: number,
    halfRootAngleCosPtr: number,
  ) => void;
};

describe('gaesup_grass_attr.wasm', () => {
  test('instantiates and generates valid orientation data', async () => {
    const wasmPath = path.resolve(process.cwd(), 'public', 'wasm', 'gaesup_grass_attr.wasm');
    const bytes = fs.readFileSync(wasmPath);

    const { instance } = await WebAssembly.instantiate(bytes, {});
    const wasm = instance.exports as unknown as Partial<GrassWasmExports>;

    expect(wasm).toBeDefined();
    expect(wasm.memory).toBeInstanceOf(WebAssembly.Memory);
    expect(typeof wasm.alloc_f32).toBe('function');
    expect(typeof wasm.dealloc_f32).toBe('function');
    expect(typeof wasm.fill_orientation_data).toBe('function');

    const exports = wasm as GrassWasmExports;

    const instances = 64;
    const seed = 123456789;
    const orientationsLen = instances * 4;

    const orientationsPtr = exports.alloc_f32(orientationsLen);
    const stretchesPtr = exports.alloc_f32(instances);
    const halfSinPtr = exports.alloc_f32(instances);
    const halfCosPtr = exports.alloc_f32(instances);

    try {
      exports.fill_orientation_data(instances, seed, orientationsPtr, stretchesPtr, halfSinPtr, halfCosPtr);

      const buffer = exports.memory.buffer;
      const orientations = new Float32Array(buffer, orientationsPtr, orientationsLen);
      const stretches = new Float32Array(buffer, stretchesPtr, instances);
      const halfSin = new Float32Array(buffer, halfSinPtr, instances);
      const halfCos = new Float32Array(buffer, halfCosPtr, instances);

      expect(orientations.length).toBe(orientationsLen);
      expect(stretches.length).toBe(instances);
      expect(halfSin.length).toBe(instances);
      expect(halfCos.length).toBe(instances);

      for (let i = 0; i < instances; i++) {
        const j = i * 4;
        const x = orientations[j];
        const y = orientations[j + 1];
        const z = orientations[j + 2];
        const w = orientations[j + 3];

        // No NaNs.
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
        expect(Number.isFinite(z)).toBe(true);
        expect(Number.isFinite(w)).toBe(true);

        // Should be unit quaternion (composition of two axis-angle rotations).
        const norm = Math.hypot(x, y, z, w);
        expect(norm).toBeGreaterThan(0.999);
        expect(norm).toBeLessThan(1.001);

        // Stretch bounds.
        expect(stretches[i]).toBeGreaterThanOrEqual(0.8);
        expect(stretches[i]).toBeLessThanOrEqual(1.0);

        // sin^2 + cos^2 ~= 1
        const s = halfSin[i];
        const c = halfCos[i];
        const sc = s * s + c * c;
        expect(sc).toBeGreaterThan(0.999);
        expect(sc).toBeLessThan(1.001);
      }
    } finally {
      exports.dealloc_f32(orientationsPtr, orientationsLen);
      exports.dealloc_f32(stretchesPtr, instances);
      exports.dealloc_f32(halfSinPtr, instances);
      exports.dealloc_f32(halfCosPtr, instances);
    }
  });
});

