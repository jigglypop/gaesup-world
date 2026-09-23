import * as THREE from 'three';

import type { GaesupCoreWasmExports } from '../../../../../wasm/loader';
import { createGrassManager, setGrassManagerWasm } from '../manager';

const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
camera.position.set(0, 2, 0); camera.lookAt(0, 0, -8); camera.updateMatrixWorld(true);
const frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
const tile = { width: 4, height: 1, center: new THREE.Vector3(0, 0, -8), maxInstances: 64 };
const args = (elapsedTime: number) => ({ elapsedTime, delta: 1 / 144, cameraPosition: camera.position, frustum });
const sources = { weather: () => null, trample: () => null };

afterEach(() => { setGrassManagerWasm(null); });

test('distinct frames are not throttled by CPU wall time; duplicates and suspended worlds do no work', () => {
  const a = createGrassManager(sources); const b = createGrassManager(sources);
  const applyA = jest.fn(); const applyB = jest.fn();
  const wall = jest.spyOn(performance, 'now').mockReturnValue(0);
  try {
    a.register({ ...tile, apply: applyA }); b.register({ ...tile, apply: applyB });
    for (let frame = 0; frame < 144; frame++) { a.tick(args(frame / 144)); a.tick(args(frame / 144)); }
    expect(applyA).toHaveBeenCalledTimes(144); expect(applyB).not.toHaveBeenCalled();
    a.suspend(); expect(applyA.mock.lastCall?.[0]).toMatchObject({ visible: false, instanceCount: 0 });
    const count = applyA.mock.calls.length;
    a.tick(args(5)); expect(applyA).toHaveBeenCalledTimes(count);
    b.tick(args(5)); expect(applyB.mock.lastCall?.[0].visible).toBe(true);
    a.resume(); a.tick(args(0)); expect(applyA.mock.lastCall?.[0].visible).toBe(true);
    a.dispose(); expect(a.size()).toBe(0); expect(b.size()).toBe(1);
  } finally { a.dispose(); b.dispose(); wall.mockRestore(); }
});

test('WASM buffers grow geometrically and are reused for steady frames, then freed at zero owners', () => {
  const memory = new WebAssembly.Memory({ initial: 1 }); let pointer = 0;
  const alloc = jest.fn((count: number) => { const result = pointer; pointer += count * 4; return result; });
  const free = jest.fn();
  const batch = jest.fn((count: number, _input: number, _x: number, _y: number, _z: number, _near: number, _far: number, _strength: number, output: number) => {
    new Float32Array(memory.buffer, output, count).fill(1);
  });
  setGrassManagerWasm({ memory, alloc_f32: alloc, dealloc_f32: free, batch_sfe_weights: batch } as unknown as GaesupCoreWasmExports);
  const manager = createGrassManager(sources); const apply = jest.fn();
  const handles = [manager.register({ ...tile, apply })];
  try {
    for (let frame = 0; frame < 144; frame++) manager.tick(args(frame / 144));
    expect(batch).toHaveBeenCalledTimes(144); expect(alloc).toHaveBeenCalledTimes(2); expect(free).not.toHaveBeenCalled();
    expect(apply.mock.lastCall?.[0].instanceCount).toBe(64);
    for (let index = 0; index < 8; index++) handles.push(manager.register({ ...tile, apply }));
    manager.tick(args(2)); expect(alloc).toHaveBeenCalledTimes(4); expect(free).toHaveBeenCalledTimes(2);
    for (const handle of handles) manager.unregister(handle.id);
    expect(free).toHaveBeenCalledTimes(4);
  } finally { manager.dispose(); }
});

test('failed second WASM allocation frees the first allocation and uses JS LOD', () => {
  const free = jest.fn(); const alloc = jest.fn().mockReturnValueOnce(0).mockImplementationOnce(() => { throw new Error('out of memory'); });
  setGrassManagerWasm({ memory: new WebAssembly.Memory({ initial: 1 }), alloc_f32: alloc, dealloc_f32: free } as unknown as GaesupCoreWasmExports);
  const manager = createGrassManager(sources); const apply = jest.fn();
  try {
    manager.register({ ...tile, apply }); manager.tick(args(0));
    expect(free).toHaveBeenCalledWith(0, 24); expect(apply.mock.lastCall?.[0].instanceCount).toBe(64);
  } finally { manager.dispose(); }
});

test('tile removal inside a callback does not update a removed tile or skip its following neighbor', () => {
  const manager = createGrassManager(sources); const removed = jest.fn(); const remaining = jest.fn();
  let removeId = 0;
  manager.register({ ...tile, apply: () => manager.unregister(removeId) });
  removeId = manager.register({ ...tile, apply: removed }).id;
  manager.register({ ...tile, apply: remaining });
  try { manager.tick(args(0)); expect(removed).not.toHaveBeenCalled(); expect(remaining).toHaveBeenCalledTimes(1); }
  finally { manager.dispose(); }
});

test('a failing tile callback does not prevent other tiles from being hidden on suspension', () => {
  const manager = createGrassManager(sources); const remaining = jest.fn();
  manager.register({ ...tile, apply: () => { throw new Error('tile callback'); } });
  manager.register({ ...tile, apply: remaining });
  expect(() => manager.suspend()).not.toThrow();
  expect(remaining.mock.lastCall?.[0]).toMatchObject({ visible: false, instanceCount: 0 });
  expect(manager.isEnabled()).toBe(false); manager.dispose();
});
