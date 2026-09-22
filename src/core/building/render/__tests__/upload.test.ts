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
  label: string | undefined;
  size: number;
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
  it.each(['allocation', 'write'] as const)(
    'keeps prior resources and releases new buffers after %s failure',
    (failure) => {
      const first = createMockDevice();
      const replacement = createMockDevice();
      const snapshot = buildBuildingRenderSnapshot({
        wallGroups: [],
        tileGroups: [],
        objects: [{ id: 'o1', type: 'fire', position: { x: 1, y: 2, z: 3 } }],
        version: 1,
      });
      const mirror = buildBuildingGpuMirror(snapshot, null);
      const prior = syncBuildingGpuBuffers(
        first.device,
        createEmptyBuildingGpuUploadResources(),
        mirror,
      );
      const create = replacement.device.createBuffer;
      replacement.device.createBuffer = (descriptor) => {
        if (failure === 'allocation' && descriptor.label === 'building-meta')
          throw new Error('allocation failed');
        return create(descriptor);
      };
      if (failure === 'write')
        replacement.device.queue.writeBuffer = () => {
          throw new Error('write failed');
        };
      expect(() => syncBuildingGpuBuffers(replacement.device, prior, mirror)).toThrow(
        `${failure} failed`,
      );
      expect(first.created.every((buffer) => !buffer.destroyed)).toBe(true);
      expect(replacement.created.length).toBeGreaterThan(0);
      expect(replacement.created.every((buffer) => buffer.destroyed)).toBe(true);
      expect(prior.device).toBe(first.device);
    },
  );

  it('preserves old indirect arguments when replacement upload fails', () => {
    const first = createMockDevice();
    const next = createMockDevice();
    const mirror = buildBuildingIndirectDrawMirror(1, new Uint32Array(12), null);
    const prior = syncBuildingIndirectArgsBuffer(
      first.device,
      createEmptyBuildingGpuUploadResources(),
      mirror,
    );
    next.device.queue.writeBuffer = () => {
      throw new Error('write failed');
    };
    expect(() => syncBuildingIndirectArgsBuffer(next.device, prior, mirror)).toThrow(
      'write failed',
    );
    expect(first.created.every((buffer) => !buffer.destroyed)).toBe(true);
    expect(next.created.every((buffer) => buffer.destroyed)).toBe(true);
  });
  it('skips repeat versions and fully populates replacement-device buffers even with no dirty ranges', () => {
    const first = createMockDevice();
    const next = createMockDevice();
    const snapshot = buildBuildingRenderSnapshot({
      wallGroups: [],
      tileGroups: [],
      objects: [{ id: 'o1', type: 'fire', position: { x: 1, y: 2, z: 3 } }],
      version: 1,
    });
    const mirror = buildBuildingGpuMirror(snapshot, null);
    const resources = syncBuildingGpuBuffers(
      first.device,
      createEmptyBuildingGpuUploadResources(),
      mirror,
    );
    first.writes.length = 0;
    expect(syncBuildingGpuBuffers(first.device, resources, mirror)).toBe(resources);
    expect(first.writes).toHaveLength(0);
    const clean = buildBuildingGpuMirror({ ...snapshot, version: 2 }, mirror);
    expect(clean.spatialDirty).toHaveLength(0);
    const replacement = syncBuildingGpuBuffers(next.device, resources, clean);
    expect(first.created.every((buffer) => buffer.destroyed)).toBe(true);
    expect(next.writes.map((write) => write.bytes)).toEqual([
      clean.spatial.byteLength,
      clean.meta.byteLength,
    ]);
    expect(replacement.device).toBe(next.device);
    expect(next.writes.every((write) => next.created.includes(write.buffer))).toBe(true);
  });

  it('repopulates indirect args on device change and independently skips repeat uploads', () => {
    const first = createMockDevice();
    const next = createMockDevice();
    const counts = new Uint32Array(12);
    counts[0] = 5;
    const mirror = buildBuildingIndirectDrawMirror(1, counts, null);
    const resources = syncBuildingIndirectArgsBuffer(
      first.device,
      createEmptyBuildingGpuUploadResources(),
      mirror,
    );
    first.writes.length = 0;
    expect(syncBuildingIndirectArgsBuffer(first.device, resources, mirror)).toBe(resources);
    expect(first.writes).toHaveLength(0);
    const clean = buildBuildingIndirectDrawMirror(2, counts, mirror);
    expect(clean.dirtyRanges).toHaveLength(0);
    syncBuildingIndirectArgsBuffer(next.device, resources, clean);
    expect(first.created.every((buffer) => buffer.destroyed)).toBe(true);
    expect(next.writes).toHaveLength(1);
    expect(next.writes[0]?.bytes).toBe(clean.args.byteLength);
  });
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

    const resources = syncBuildingGpuBuffers(
      device,
      createEmptyBuildingGpuUploadResources(),
      mirror,
    );

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
    const firstResources = syncBuildingGpuBuffers(
      device,
      createEmptyBuildingGpuUploadResources(),
      firstMirror,
    );

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
    const firstResources = syncBuildingGpuBuffers(
      device,
      createEmptyBuildingGpuUploadResources(),
      firstMirror,
    );

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
