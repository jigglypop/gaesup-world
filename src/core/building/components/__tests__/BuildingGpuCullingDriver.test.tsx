import { act, render } from '@testing-library/react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useBuildingRenderStateStore } from '../../render/store';
import { useBuildingGpuCullingStore } from '../../render/cullingStore';
import { BuildingGpuCullingDriver } from '../BuildingGpuCullingDriver';

jest.mock('@react-three/fiber', () => ({ useFrame: jest.fn(), useThree: jest.fn() }));

function createDevice(writes: Float32Array[] = []) {
  return {
    createBuffer: jest.fn((_options: { label?: string }) => ({ destroy: jest.fn() })),
    createShaderModule: jest.fn(() => ({})),
    createComputePipeline: () => ({ getBindGroupLayout: () => ({}) }),
    createBindGroup: jest.fn((_options: { entries: Array<{ binding: number; resource: { buffer: object } }> }) => ({})),
    createCommandEncoder: () => ({
      beginComputePass: () => ({ setPipeline() {}, setBindGroup() {}, dispatchWorkgroups() {}, end() {} }),
      copyBufferToBuffer() {}, finish: () => ({}),
    }),
    queue: { writeBuffer: (_buffer: object, _offset: number, data: Float32Array) => writes.push(data.slice()), submit() {} },
  };
}

test.each(['write', 'encoder', 'submit'] as const)('GPU %s failure releases resources and stops retrying the failed device', (stage) => {
  const previous = useBuildingRenderStateStore.getState();
  const previousCulling = useBuildingGpuCullingStore.getState();
  const device = createDevice();
  const failure = jest.fn(() => { throw new Error('submission failed'); });
  if (stage === 'write') device.queue.writeBuffer = failure;
  if (stage === 'encoder') device.createCommandEncoder = failure;
  if (stage === 'submit') device.queue.submit = failure;
  jest.mocked(useThree).mockImplementation((selector) => selector!({ gl: { backend: { device } } } as unknown as Parameters<NonNullable<typeof selector>>[0]));
  useBuildingRenderStateStore.setState({
    snapshot: { ...previous.snapshot, version: 1, ids: ['sphere'] },
    uploadResources: { ...previous.uploadResources, backend: 'webgpu', spatialBuffer: {} },
  });
  useBuildingGpuCullingStore.getState().setResult({ version: 1, tileIds: new Set(), wallIds: new Set(), objectIds: new Set(), clusterCounts: new Uint32Array() });
  const now = jest.spyOn(performance, 'now').mockReturnValue(1000);
  const view = render(<BuildingGpuCullingDriver />);
  try {
    const frame = jest.mocked(useFrame).mock.calls.at(-1)![0];
    const state = { camera: new THREE.PerspectiveCamera() } as Parameters<typeof frame>[0];
    expect(() => act(() => frame(state, 0.2))).not.toThrow();
    expect(useBuildingGpuCullingStore.getState().active).toBe(false);
    expect(device.createBuffer).toHaveBeenCalledTimes(3);
    now.mockReturnValue(2000);
    act(() => frame(state, 0.2));
    expect(failure).toHaveBeenCalledTimes(1);
    view.unmount();
    for (const result of device.createBuffer.mock.results) {
      expect(result.value.destroy).toHaveBeenCalledTimes(1);
    }
  } finally {
    view.unmount();
    now.mockRestore();
    useBuildingRenderStateStore.setState(previous);
    useBuildingGpuCullingStore.setState(previousCulling);
  }
});

test('reuses completed stationary culling and recomputes after camera or snapshot changes', async () => {
  const previous = useBuildingRenderStateStore.getState();
  const previousCulling = useBuildingGpuCullingStore.getState();
  const writes: Float32Array[] = [];
  const device = createDevice(writes);
  const readBuffer = {
    destroy: jest.fn(), mapAsync: jest.fn(async () => undefined),
    getMappedRange: () => new Uint32Array([1]).buffer, unmap: jest.fn(),
  };
  device.createBuffer.mockImplementation(({ label }) => label === 'building-cull-readback' ? readBuffer : { destroy: jest.fn() });
  jest.mocked(useThree).mockImplementation((selector) => selector!({ gl: { backend: { device } } } as unknown as Parameters<NonNullable<typeof selector>>[0]));
  useBuildingGpuCullingStore.getState().reset();
  useBuildingRenderStateStore.setState({
    snapshot: { ...previous.snapshot, version: 1, ids: ['sphere'] },
    uploadResources: { ...previous.uploadResources, backend: 'webgpu', spatialBuffer: {} },
  });
  const now = jest.spyOn(performance, 'now').mockReturnValue(1000);
  const camera = new THREE.PerspectiveCamera();
  const view = render(<BuildingGpuCullingDriver />);
  const runFrame = async (time: number) => {
    now.mockReturnValue(time);
    const frame = jest.mocked(useFrame).mock.calls.at(-1)![0];
    await act(async () => { frame({ camera } as Parameters<typeof frame>[0], 0.2); });
  };
  try {
    await runFrame(1000);
    for (let frame = 1; frame <= 20; frame++) await runFrame(1000 + frame * 200);
    expect(writes).toHaveLength(1);
    expect(readBuffer.mapAsync).toHaveBeenCalledTimes(1);
    camera.position.x = 10;
    await runFrame(6000);
    expect(writes).toHaveLength(2);
    camera.fov = 30;
    camera.updateProjectionMatrix();
    await runFrame(6200);
    expect(writes).toHaveLength(3);
    act(() => useBuildingRenderStateStore.setState({ snapshot: {
      ...useBuildingRenderStateStore.getState().snapshot, version: 2,
    } }));
    await runFrame(6400);
    expect(writes).toHaveLength(4);
  } finally {
    view.unmount();
    now.mockRestore();
    useBuildingRenderStateStore.setState(previous);
    useBuildingGpuCullingStore.setState(previousCulling);
  }
});

test.each(['sync', 'async', 'range'] as const)('cleans up %s readback failures without retrying', async (stage) => {
  const previous = useBuildingRenderStateStore.getState();
  const previousCulling = useBuildingGpuCullingStore.getState();
  const failure = new Error('readback failed');
  const device = createDevice();
  const readBuffer = {
    destroy: jest.fn(),
    mapAsync: jest.fn(() => {
      if (stage === 'sync') throw failure;
      return stage === 'async' ? Promise.reject(failure) : Promise.resolve();
    }),
    getMappedRange: () => { throw failure; },
    unmap: jest.fn(),
  };
  device.createBuffer.mockImplementation(({ label }) => label === 'building-cull-readback' ? readBuffer : { destroy: jest.fn() });
  jest.mocked(useThree).mockImplementation((selector) => selector!({ gl: { backend: { device } } } as unknown as Parameters<NonNullable<typeof selector>>[0]));
  useBuildingGpuCullingStore.getState().reset();
  useBuildingRenderStateStore.setState({
    snapshot: { ...previous.snapshot, version: 1, ids: ['sphere'] },
    uploadResources: { ...previous.uploadResources, backend: 'webgpu', spatialBuffer: {} },
  });
  const now = jest.spyOn(performance, 'now').mockReturnValue(1000);
  const view = render(<BuildingGpuCullingDriver />);
  try {
    const frame = jest.mocked(useFrame).mock.calls.at(-1)![0];
    const state = { camera: new THREE.PerspectiveCamera() } as Parameters<typeof frame>[0];
    await act(async () => { frame(state, 0.2); });
    expect(useBuildingGpuCullingStore.getState().active).toBe(false);
    expect(readBuffer.destroy).toHaveBeenCalledTimes(1);
    now.mockReturnValue(2000);
    await act(async () => { frame(state, 0.2); });
    expect(readBuffer.mapAsync).toHaveBeenCalledTimes(1);
    view.unmount();
    for (const result of device.createBuffer.mock.results) expect(result.value.destroy).toHaveBeenCalledTimes(1);
  } finally {
    view.unmount();
    now.mockRestore();
    useBuildingRenderStateStore.setState(previous);
    useBuildingGpuCullingStore.setState(previousCulling);
  }
});

test.each(['unmount', 'snapshot', 'buffers'] as const)('late readback rejection preserves newer results after %s', async (change) => {
  const previous = useBuildingRenderStateStore.getState();
  const previousCulling = useBuildingGpuCullingStore.getState();
  let rejectRead!: (error: Error) => void;
  const pending = new Promise<void>((_resolve, reject) => { rejectRead = reject; });
  const oldReadBuffer = {
    destroy: jest.fn(), mapAsync: jest.fn(() => pending),
    getMappedRange: jest.fn(), unmap: jest.fn(),
  };
  const newReadBuffer = {
    destroy: jest.fn(), mapAsync: jest.fn(async () => undefined),
    getMappedRange: () => new Uint32Array([1]).buffer, unmap: jest.fn(),
  };
  const device = createDevice();
  let readbackAllocations = 0;
  device.createBuffer.mockImplementation(({ label }) => label === 'building-cull-readback'
    ? (++readbackAllocations === 1 ? oldReadBuffer : newReadBuffer)
    : { destroy: jest.fn() });
  jest.mocked(useThree).mockImplementation((selector) => selector!({ gl: { backend: { device } } } as unknown as Parameters<NonNullable<typeof selector>>[0]));
  useBuildingGpuCullingStore.getState().reset();
  useBuildingRenderStateStore.setState({
    snapshot: { ...previous.snapshot, version: 1, ids: ['sphere'] },
    uploadResources: { ...previous.uploadResources, backend: 'webgpu', spatialBuffer: {} },
  });
  const now = jest.spyOn(performance, 'now').mockReturnValue(1000);
  const view = render(<BuildingGpuCullingDriver />);
  const camera = new THREE.PerspectiveCamera();
  try {
    const frame = jest.mocked(useFrame).mock.calls.at(-1)![0];
    await act(async () => { frame({ camera } as Parameters<typeof frame>[0], 0.2); });
    expect(oldReadBuffer.mapAsync).toHaveBeenCalledTimes(1);
    if (change === 'unmount') view.unmount();
    else act(() => {
      const current = useBuildingRenderStateStore.getState();
      useBuildingRenderStateStore.setState({
        snapshot: { ...current.snapshot, version: 2 },
        ...(change === 'buffers' ? { uploadResources: { ...current.uploadResources, spatialBuffer: {} } } : {}),
      });
    });
    useBuildingGpuCullingStore.getState().setResult({ version: 99, tileIds: new Set(['new']), wallIds: new Set(), objectIds: new Set(), clusterCounts: new Uint32Array() });
    const newerResult = useBuildingGpuCullingStore.getState();
    await act(async () => { rejectRead(new Error('late readback failure')); });
    expect(useBuildingGpuCullingStore.getState()).toBe(newerResult);
    expect(oldReadBuffer.getMappedRange).not.toHaveBeenCalled();
    expect(oldReadBuffer.destroy).toHaveBeenCalledTimes(1);
    if (change === 'buffers') {
      now.mockReturnValue(2000);
      const nextFrame = jest.mocked(useFrame).mock.calls.at(-1)![0];
      await act(async () => { nextFrame({ camera } as Parameters<typeof nextFrame>[0], 0.2); });
      expect(newReadBuffer.mapAsync).toHaveBeenCalledTimes(1);
      expect(useBuildingGpuCullingStore.getState().version).toBe(2);
    }
    view.unmount();
    expect(oldReadBuffer.destroy).toHaveBeenCalledTimes(1);
  } finally {
    view.unmount();
    now.mockRestore();
    useBuildingRenderStateStore.setState(previous);
    useBuildingGpuCullingStore.setState(previousCulling);
  }
});

test.each([THREE.WebGLCoordinateSystem, THREE.WebGPUCoordinateSystem])('uploads world-space sphere planes for coordinate system %i', (coordinateSystem) => {
  const previous = useBuildingRenderStateStore.getState();
  const writes: Float32Array[] = [];
  const device = createDevice(writes);
  jest.mocked(useThree).mockImplementation((selector) => selector!({ gl: { backend: { device } } } as unknown as Parameters<NonNullable<typeof selector>>[0]));
  useBuildingRenderStateStore.setState({
    snapshot: { ...previous.snapshot, version: 1, ids: ['sphere'] },
    uploadResources: { ...previous.uploadResources, backend: 'webgpu', spatialBuffer: {}, metaBuffer: null },
  });
  const now = jest.spyOn(performance, 'now').mockReturnValue(1000);
  const camera = new THREE.PerspectiveCamera(20, 1, 10, 100);
  camera.coordinateSystem = coordinateSystem;
  camera.updateProjectionMatrix();
  const parent = new THREE.Group();
  parent.position.x = 25;
  parent.add(camera);
  const view = render(<BuildingGpuCullingDriver />);
  try {
    const frame = jest.mocked(useFrame).mock.calls.at(-1)![0];
    frame({ camera } as Parameters<typeof frame>[0], 0.2);
    const uniform = writes[0]!;
    expect(device.createBindGroup.mock.calls[0]![0].entries.map((entry) => entry.binding)).toEqual([0, 2, 3]);
    expect(uniform.length).toBe(32);
    expect([...uniform.slice(24, 27)]).toEqual([25, 0, 0]);
    const visible = (x: number, z: number, radius: number) => {
      for (let plane = 0; plane < 6; plane++) {
        const offset = plane * 4;
        if (uniform[offset]! * x + uniform[offset + 2]! * z + uniform[offset + 3]! < -radius) return false;
      }
      return true;
    };
    expect(visible(25, -7, 1)).toBe(false);
    expect(visible(25, -20, 1)).toBe(true);
    expect(visible(29, -20, 1)).toBe(true);
    expect(visible(32, -20, 1)).toBe(false);
    expect(visible(25, -110, 1)).toBe(false);
  } finally {
    view.unmount();
    now.mockRestore();
    useBuildingRenderStateStore.setState(previous);
  }
});

test.each(['unmount', 'snapshot', 'buffers', 'camera'] as const)('handles a pending readback after %s changes', async (change) => {
  const previous = useBuildingRenderStateStore.getState();
  const previousCulling = useBuildingGpuCullingStore.getState();
  let resolve!: () => void;
  const pending = new Promise<void>((accept) => { resolve = accept; });
  const readBuffer = {
    destroy: jest.fn(), mapAsync: () => pending,
    getMappedRange: jest.fn(() => new Uint32Array([1]).buffer), unmap: jest.fn(),
  };
  const device = createDevice();
  device.createBuffer.mockImplementation(({ label }) => label === 'building-cull-readback' ? readBuffer : { destroy: jest.fn() });
  jest.mocked(useThree).mockImplementation((selector) => selector!({ gl: { backend: { device } } } as unknown as Parameters<NonNullable<typeof selector>>[0]));
  useBuildingRenderStateStore.setState({
    snapshot: { ...previous.snapshot, version: 1, ids: ['old'] },
    uploadResources: { ...previous.uploadResources, backend: 'webgpu', spatialBuffer: {}, metaBuffer: {} },
  });
  const now = jest.spyOn(performance, 'now').mockReturnValue(1000);
  const view = render(<BuildingGpuCullingDriver />);
  try {
    const frame = jest.mocked(useFrame).mock.calls.at(-1)![0];
    const camera = new THREE.PerspectiveCamera();
    frame({ camera } as Parameters<typeof frame>[0], 0.2);
    const requestedMatrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).toArray();
    if (change === 'unmount') view.unmount();
    else if (change === 'camera') {
      camera.position.x = 25;
      camera.updateWorldMatrix(true, false);
    }
    else act(() => {
      const state = useBuildingRenderStateStore.getState();
      if (change === 'snapshot') useBuildingRenderStateStore.setState({ snapshot: { ...state.snapshot, version: 2 } });
      else useBuildingRenderStateStore.setState({ uploadResources: { ...state.uploadResources, spatialBuffer: {} } });
    });
    useBuildingGpuCullingStore.getState().setResult({ version: 99, tileIds: new Set(['new']), wallIds: new Set(), objectIds: new Set(), clusterCounts: new Uint32Array() });
    const current = useBuildingGpuCullingStore.getState();
    await act(async () => { resolve(); await pending; });
    if (change === 'camera') {
      expect(useBuildingGpuCullingStore.getState().camera).toEqual({
        viewProjection: requestedMatrix, position: [0, 0, 0],
        coordinateSystem: camera.coordinateSystem, reversedDepth: camera.reversedDepth,
      });
      expect(readBuffer.unmap).toHaveBeenCalledTimes(1);
    } else {
      expect(useBuildingGpuCullingStore.getState()).toBe(current);
      expect(readBuffer.getMappedRange).not.toHaveBeenCalled();
    }
    if (change === 'snapshot') expect(readBuffer.unmap).toHaveBeenCalledTimes(1);
  } finally {
    view.unmount();
    now.mockRestore();
    useBuildingRenderStateStore.setState(previous);
    useBuildingGpuCullingStore.setState(previousCulling);
  }
});

test.each([2, 3, 4])('releases partial allocations when GPU setup step %i fails and keeps CPU visibility', (failureStep) => {
  const previous = useBuildingRenderStateStore.getState();
  const previousCulling = useBuildingGpuCullingStore.getState();
  const device = createDevice();
  const created: Array<{ destroy: jest.Mock }> = [];
  let step = 0;
  device.createBuffer.mockImplementation(() => {
    if (++step === failureStep) throw new Error('allocation failed');
    const buffer = { destroy: jest.fn() };
    created.push(buffer);
    return buffer;
  });
  device.createBindGroup.mockImplementation(() => { throw new Error('binding failed'); });
  jest.mocked(useThree).mockImplementation((selector) => selector!({ gl: { backend: { device } } } as unknown as Parameters<NonNullable<typeof selector>>[0]));
  useBuildingRenderStateStore.setState({
    snapshot: { ...previous.snapshot, version: 1, ids: ['sphere'] },
    uploadResources: { ...previous.uploadResources, backend: 'webgpu', spatialBuffer: {}, metaBuffer: {} },
  });
  useBuildingGpuCullingStore.getState().setResult({ version: 1, tileIds: new Set(), wallIds: new Set(), objectIds: new Set(), clusterCounts: new Uint32Array() });
  const now = jest.spyOn(performance, 'now').mockReturnValue(1000);
  const view = render(<BuildingGpuCullingDriver />);
  try {
    const frame = jest.mocked(useFrame).mock.calls.at(-1)![0];
    const state = { camera: new THREE.PerspectiveCamera() } as Parameters<typeof frame>[0];
    act(() => frame(state, 0.2));
    expect(useBuildingGpuCullingStore.getState().active).toBe(false);
    expect(created).toHaveLength(failureStep - 1);
    for (const buffer of created) expect(buffer.destroy).toHaveBeenCalledTimes(1);
    now.mockReturnValue(2000);
    act(() => frame(state, 0.2));
    expect(device.createShaderModule).toHaveBeenCalledTimes(1);
    view.unmount();
    for (const buffer of created) expect(buffer.destroy).toHaveBeenCalledTimes(1);
  } finally {
    view.unmount();
    now.mockRestore();
    useBuildingRenderStateStore.setState(previous);
    useBuildingGpuCullingStore.setState(previousCulling);
  }
});
