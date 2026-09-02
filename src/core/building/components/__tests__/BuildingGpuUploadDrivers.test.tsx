import React from 'react';

import { useThree } from '@react-three/fiber';
import { act, render } from '@testing-library/react';

import { buildBuildingRenderSnapshot } from '../../render/core';
import { buildBuildingIndirectDrawMirror } from '../../render/draw';
import { buildBuildingGpuMirror, type BuildingGpuBufferMirror } from '../../render/gpu';
import { useBuildingRenderStateStore } from '../../render/store';
import type { GpuBufferLike, GpuDeviceLike } from '../../render/upload';
import { BuildingGpuUploadDriver } from '../BuildingGpuUploadDriver';
import { BuildingIndirectArgsUploadDriver } from '../BuildingIndirectArgsUploadDriver';

jest.mock('@react-three/fiber', () => ({
  useThree: jest.fn(),
}));

type RendererSelector = (state: { gl: object }) => unknown;
type TrackedBuffer = GpuBufferLike & {
  label?: string;
  destroy: jest.MockedFunction<() => void>;
};

const mockUseThree = useThree as unknown as jest.MockedFunction<
  (selector: RendererSelector) => unknown
>;

function createMockDevice() {
  const created: TrackedBuffer[] = [];
  const device: GpuDeviceLike = {
    createBuffer: ({ label }) => {
      const buffer: TrackedBuffer = {
        label,
        destroy: jest.fn(),
      };
      created.push(buffer);
      return buffer;
    },
    queue: {
      writeBuffer: jest.fn(),
    },
  };
  return { created, device };
}

function buildMirror(
  version: number,
  x: number,
  previous: BuildingGpuBufferMirror | null,
): BuildingGpuBufferMirror {
  const snapshot = buildBuildingRenderSnapshot({
    wallGroups: [],
    tileGroups: [],
    objects: [{ id: 'fire', type: 'fire', position: { x, y: 0, z: 0 } }],
    version,
  });
  return buildBuildingGpuMirror(snapshot, previous);
}

function renderUploadDrivers() {
  return render(
    <>
      <BuildingGpuUploadDriver />
      <BuildingIndirectArgsUploadDriver />
    </>,
  );
}

function uploadAllResources() {
  const firstMirror = buildMirror(1, 0, null);
  act(() => {
    useBuildingRenderStateStore.getState().setGpuMirror(firstMirror);
  });

  const counts = new Uint32Array(10);
  counts[1] = 1;
  act(() => {
    useBuildingRenderStateStore
      .getState()
      .setDrawMirror(buildBuildingIndirectDrawMirror(2, counts, null));
  });

  return firstMirror;
}

describe('building gpu upload drivers', () => {
  beforeEach(() => {
    useBuildingRenderStateStore.getState().reset();
  });

  afterEach(() => {
    useBuildingRenderStateStore.getState().reset();
    jest.clearAllMocks();
  });

  it('retains indirect args across a same-size spatial update and destroys every buffer on unmount', () => {
    const { created, device } = createMockDevice();
    const renderer = { backend: { device } };
    mockUseThree.mockImplementation((selector) => selector({ gl: renderer }));
    const view = renderUploadDrivers();
    const firstMirror = uploadAllResources();
    const indirectArgsBuffer = useBuildingRenderStateStore.getState().uploadResources
      .indirectArgsBuffer as TrackedBuffer;

    act(() => {
      useBuildingRenderStateStore.getState().setGpuMirror(buildMirror(3, 4, firstMirror));
    });

    const current = useBuildingRenderStateStore.getState().uploadResources;
    expect(current.indirectArgsBuffer).toBe(indirectArgsBuffer);
    expect(indirectArgsBuffer.destroy).not.toHaveBeenCalled();
    expect(created).toHaveLength(3);

    view.unmount();

    expect(useBuildingRenderStateStore.getState().uploadResources.backend).toBe('none');
    for (const buffer of created) {
      expect(buffer.destroy).toHaveBeenCalledTimes(1);
    }
  });

  it('does not destroy buffers again when reset precedes driver unmount', () => {
    const { created, device } = createMockDevice();
    const renderer = { backend: { device } };
    mockUseThree.mockImplementation((selector) => selector({ gl: renderer }));
    const view = renderUploadDrivers();
    uploadAllResources();

    act(() => {
      useBuildingRenderStateStore.getState().reset();
    });
    view.unmount();

    expect(created).toHaveLength(3);
    for (const buffer of created) {
      expect(buffer.destroy).toHaveBeenCalledTimes(1);
    }
  });

  it('destroys both StrictMode resource generations exactly once', () => {
    const { created, device } = createMockDevice();
    const renderer = { backend: { device } };
    mockUseThree.mockImplementation((selector) => selector({ gl: renderer }));
    uploadAllResources();
    const view = render(
      <React.StrictMode>
        <BuildingGpuUploadDriver />
        <BuildingIndirectArgsUploadDriver />
      </React.StrictMode>,
    );

    expect(created).toHaveLength(6);
    view.unmount();
    useBuildingRenderStateStore.getState().reset();

    for (const buffer of created) {
      expect(buffer.destroy).toHaveBeenCalledTimes(1);
    }
  });
});
