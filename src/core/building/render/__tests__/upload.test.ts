import { buildBuildingRenderSnapshot } from '../core';
import { buildBuildingIndirectDrawMirror } from '../draw';
import { buildBuildingGpuMirror } from '../gpu';
import {
  createEmptyBuildingGpuUploadResources,
  syncBuildingIndirectArgsBuffer,
  syncBuildingGpuBuffers,
  type GpuBufferLike,
  type GpuDeviceLike,
} from '../upload';

type MockBuffer = GpuBufferLike & {
  label?: string;
  size?: number;
  destroyed: boolean;
};

function createMockDevice() {
  const created: MockBuffer[] = [];
  const writes: Array<{ buffer: MockBuffer; offset: number; bytes: number }> = [];
  const device: GpuDeviceLike = {
    createBuffer: ({ label, size }) => {
      const buffer: MockBuffer = {
        label,
        size,
        destroyed: false,
        destroy() {
          buffer.destroyed = true;
        },
      };
      created.push(buffer);
      return buffer;
    },
    queue: {
      writeBuffer(buffer, bufferOffset, data) {
        writes.push({
          buffer: buffer as MockBuffer,
          offset: bufferOffset,
          bytes: (data as ArrayBufferView).byteLength,
        });
      },
    },
  };
  return { device, created, writes };
}

describe('building gpu upload bridge', () => {
  it('creates buffers and uploads full dirty slices on first sync', () => {
    const { device, created, writes } = createMockDevice();
    const snapshot = buildBuildingRenderSnapshot({
      wallGroups: [],
      tileGroups: [
        {
          id: 'tiles',
          name: 'Tiles',
          floorMeshId: 'wood-floor',
          tiles: [{ id: 't1', tileGroupId: 'tiles', position: { x: 1, y: 0, z: 2 }, size: 1 }],
        },
      ],
      objects: [],
      version: 1,
    });
    const mirror = buildBuildingGpuMirror(snapshot, null);

    const resources = syncBuildingGpuBuffers(device, createEmptyBuildingGpuUploadResources(), mirror);

    expect(resources.backend).toBe('webgpu');
    expect(resources.uploadedVersion).toBe(1);
    expect(created).toHaveLength(2);
    expect(writes).toHaveLength(2);
  });

  it('uploads only dirty ranges when data changes', () => {
    const { device, writes } = createMockDevice();
    const firstSnapshot = buildBuildingRenderSnapshot({
      wallGroups: [],
      tileGroups: [
        {
          id: 'tiles',
          name: 'Tiles',
          floorMeshId: 'wood-floor',
          tiles: [{ id: 't1', tileGroupId: 'tiles', position: { x: 1, y: 0, z: 2 }, size: 1 }],
        },
      ],
      objects: [],
      version: 1,
    });
    const firstMirror = buildBuildingGpuMirror(firstSnapshot, null);
    const firstResources = syncBuildingGpuBuffers(device, createEmptyBuildingGpuUploadResources(), firstMirror);

    writes.length = 0;

    const nextSnapshot = buildBuildingRenderSnapshot({
      wallGroups: [],
      tileGroups: [
        {
          id: 'tiles',
          name: 'Tiles',
          floorMeshId: 'wood-floor',
          tiles: [{ id: 't1', tileGroupId: 'tiles', position: { x: 7, y: 0, z: 2 }, size: 1 }],
        },
      ],
      objects: [],
      version: 2,
    });
    const nextMirror = buildBuildingGpuMirror(nextSnapshot, firstMirror);
    syncBuildingGpuBuffers(device, firstResources, nextMirror);

    expect(writes).toHaveLength(1);
    expect(writes[0]?.offset).toBe(0);
  });

  it('destroys and recreates buffers when size changes', () => {
    const { device, created } = createMockDevice();
    const firstSnapshot = buildBuildingRenderSnapshot({
      wallGroups: [],
      tileGroups: [],
      objects: [{ id: 'o1', type: 'fire', position: { x: 0, y: 0, z: 0 } }],
      version: 1,
    });
    const firstMirror = buildBuildingGpuMirror(firstSnapshot, null);
    const firstResources = syncBuildingGpuBuffers(device, createEmptyBuildingGpuUploadResources(), firstMirror);

    const secondSnapshot = buildBuildingRenderSnapshot({
      wallGroups: [],
      tileGroups: [],
      objects: [
        { id: 'o1', type: 'fire', position: { x: 0, y: 0, z: 0 } },
        { id: 'o2', type: 'billboard', position: { x: 4, y: 0, z: 0 } },
      ],
      version: 2,
    });
    const secondMirror = buildBuildingGpuMirror(secondSnapshot, firstMirror);
    const secondResources = syncBuildingGpuBuffers(device, firstResources, secondMirror);

    expect(created.length).toBeGreaterThanOrEqual(4);
    expect((firstResources.spatialBuffer as MockBuffer).destroyed).toBe(true);
    expect((firstResources.metaBuffer as MockBuffer).destroyed).toBe(true);
    expect(secondResources.spatialBytes).toBeGreaterThan(firstResources.spatialBytes);
  });

  it('uploads indirect draw args into a dedicated GPU buffer', () => {
    const { device, created, writes } = createMockDevice();
    const counts = new Uint32Array(10);
    counts[1] = 12;
    counts[8] = 2;
    const drawMirror = buildBuildingIndirectDrawMirror(3, counts, null);

    const resources = syncBuildingIndirectArgsBuffer(
      device,
      createEmptyBuildingGpuUploadResources(),
      drawMirror,
    );

    expect(resources.indirectArgsBuffer).toBeTruthy();
    expect(resources.indirectArgsBytes).toBeGreaterThan(0);
    expect(created.some((buffer) => buffer.label === 'building-indirect-args')).toBe(true);
    expect(writes.length).toBeGreaterThan(0);
  });
});
