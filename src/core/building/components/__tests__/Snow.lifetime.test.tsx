import { act } from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { loadCoreWasm, type GaesupCoreWasmExports } from '../../../wasm/loader';
import { Snow } from '../mesh/snow';

jest.mock('../../../wasm/loader', () => ({ loadCoreWasm: jest.fn() }));

test('rerendering retains particle storage and does not restart simulation', async () => {
  jest.mocked(loadCoreWasm).mockClear().mockResolvedValue(null);
  const view = await ReactThreeTestRenderer.create(<Snow />);
  try {
    const points = view.scene.findByType('Points').instance as THREE.Points;
    const geometry = points.geometry;
    const particles = geometry.getAttribute('position').array;
    await view.advanceFrames(1, 1 / 60);
    const height = geometry.getAttribute('position').getY(0);
    await view.update(<Snow followCamera />);
    expect(points.geometry).toBe(geometry);
    expect(geometry.getAttribute('position').array).toBe(particles);
    expect(geometry.getAttribute('position').getY(0)).toBe(height);
    expect(loadCoreWasm).toHaveBeenCalledTimes(1);
  } finally {
    await view.unmount();
  }
});

test('WASM frames reuse position views and refresh after memory growth', async () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const update = jest.fn(() => { new Float32Array(memory.buffer, 4, 6000)[1] = 7; });
  jest.mocked(loadCoreWasm).mockResolvedValue({ memory,
    alloc_f32: jest.fn().mockReturnValueOnce(4).mockReturnValueOnce(24004).mockReturnValueOnce(48004),
    dealloc_f32: jest.fn(), update_snow_particles: update } as unknown as GaesupCoreWasmExports);
  const view = await ReactThreeTestRenderer.create(<Snow />);
  try {
    const points = view.scene.findByType('Points').instance as THREE.Points;
    await view.advanceFrames(1, 1 / 60);
    const first = points.geometry.getAttribute('position').array;
    await view.advanceFrames(5, 1 / 60);
    expect(points.geometry.getAttribute('position').array).toBe(first);
    memory.grow(1);
    await view.advanceFrames(1, 1 / 60);
    const second = points.geometry.getAttribute('position').array;
    expect(second).not.toBe(first);
    expect(second.buffer).toBe(memory.buffer);
    expect(second[1]).toBe(7);
    update.mockImplementationOnce(() => { memory.grow(1); });
    await view.advanceFrames(1, 1 / 60);
    expect(points.geometry.getAttribute('position').array.buffer).toBe(memory.buffer);
    await view.advanceFrames(1, 1 / 60);
    expect(points.geometry.getAttribute('position').getY(0)).toBe(7);
  } finally {
    await view.unmount();
  }
});

test('partial allocation failure releases memory and leaves CPU simulation running', async () => {
  const dealloc = jest.fn();
  jest.mocked(loadCoreWasm).mockResolvedValue({ memory: new WebAssembly.Memory({ initial: 1 }),
    alloc_f32: jest.fn().mockReturnValueOnce(4).mockImplementationOnce(() => { throw new Error('allocation failed'); }),
    dealloc_f32: dealloc } as unknown as GaesupCoreWasmExports);
  const view = await ReactThreeTestRenderer.create(<Snow />);
  try {
    expect(dealloc.mock.calls).toEqual([[4, 6000]]);
    const points = view.scene.findByType('Points').instance as THREE.Points;
    const before = points.geometry.getAttribute('position').getY(0);
    await view.advanceFrames(1, 1 / 60);
    expect(points.geometry.getAttribute('position').getY(0)).not.toBe(before);
  } finally {
    await view.unmount();
  }
  expect(dealloc).toHaveBeenCalledTimes(1);
});

test('CPU simulation updates the buffer that is uploaded to the renderer', async () => {
  jest.mocked(loadCoreWasm).mockResolvedValue(null);
  const view = await ReactThreeTestRenderer.create(<Snow />);
  try {
    const points = view.scene.findByType('Points').instance as THREE.Points;
    const positions = points.geometry.getAttribute('position');
    const before = positions.getY(0);
    await view.advanceFrames(1, 1 / 60);
    expect(positions.getY(0)).not.toBe(before);
    expect(points.geometry.getAttribute('position')).toBe(positions);
  } finally {
    await view.unmount();
  }
});

test('unmount before WASM readiness does not allocate particle memory', async () => {
  let resolve!: (value: GaesupCoreWasmExports) => void;
  jest.mocked(loadCoreWasm).mockReturnValue(new Promise((done) => { resolve = done; }));
  const alloc = jest.fn();
  const view = await ReactThreeTestRenderer.create(<Snow />);
  await view.unmount();
  await act(async () => { resolve({ alloc_f32: alloc } as unknown as GaesupCoreWasmExports); });
  expect(alloc).not.toHaveBeenCalled();
});

test('loaded WASM allocations are released once on unmount', async () => {
  const alloc = jest.fn().mockReturnValueOnce(4).mockReturnValueOnce(24004).mockReturnValueOnce(48004);
  const dealloc = jest.fn();
  jest.mocked(loadCoreWasm).mockResolvedValue({ memory: new WebAssembly.Memory({ initial: 1 }),
    alloc_f32: alloc, dealloc_f32: dealloc } as unknown as GaesupCoreWasmExports);
  const view = await ReactThreeTestRenderer.create(<Snow />);
  expect(alloc.mock.calls).toEqual([[6000], [6000], [6]]);
  await view.unmount();
  expect(dealloc.mock.calls).toEqual([[4, 6000], [24004, 6000], [48004, 6]]);
});
