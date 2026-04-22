import { buildBuildingRenderSnapshot } from '../core';
import {
  buildBuildingGpuMirror,
  createBuildingGpuUploadPlan,
  GPU_META_STRIDE,
  GPU_SPATIAL_STRIDE,
} from '../gpu';

describe('building gpu mirror', () => {
  it('marks full buffers dirty on first mirror build', () => {
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

    expect(mirror.count).toBe(1);
    expect(mirror.spatialDirty).toEqual([{ start: 0, end: 1 }]);
    expect(mirror.metaDirty).toEqual([{ start: 0, end: 1 }]);
  });

  it('tracks only changed entity ranges between versions', () => {
    const prev = buildBuildingRenderSnapshot({
      wallGroups: [],
      tileGroups: [
        {
          id: 'tiles',
          name: 'Tiles',
          floorMeshId: 'wood-floor',
          tiles: [
            { id: 't1', tileGroupId: 'tiles', position: { x: 1, y: 0, z: 2 }, size: 1 },
            { id: 't2', tileGroupId: 'tiles', position: { x: 4, y: 0, z: 2 }, size: 1 },
          ],
        },
      ],
      objects: [{ id: 'o1', type: 'fire', position: { x: 8, y: 0, z: 8 } }],
      version: 1,
    });
    const next = buildBuildingRenderSnapshot({
      wallGroups: [],
      tileGroups: [
        {
          id: 'tiles',
          name: 'Tiles',
          floorMeshId: 'wood-floor',
          tiles: [
            { id: 't1', tileGroupId: 'tiles', position: { x: 1, y: 0, z: 2 }, size: 1 },
            { id: 't2', tileGroupId: 'tiles', position: { x: 7, y: 0, z: 2 }, size: 1 },
          ],
        },
      ],
      objects: [{ id: 'o1', type: 'fire', position: { x: 8, y: 0, z: 8 } }],
      version: 2,
    });

    const prevMirror = buildBuildingGpuMirror(prev, null);
    const nextMirror = buildBuildingGpuMirror(next, prevMirror);

    expect(nextMirror.count).toBe(2);
    expect(nextMirror.spatialDirty).toEqual([{ start: 0, end: 1 }]);
    expect(nextMirror.metaDirty).toEqual([]);
  });

  it('creates upload slices with byte offsets', () => {
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
      version: 3,
    });

    const mirror = buildBuildingGpuMirror(snapshot, null);
    const plan = createBuildingGpuUploadPlan(mirror);

    expect(plan.spatial).toHaveLength(1);
    expect(plan.meta).toHaveLength(1);
    expect(plan.spatial[0]?.byteOffset).toBe(0);
    expect(plan.spatial[0]?.elementCount).toBe(GPU_SPATIAL_STRIDE);
    expect(plan.meta[0]?.elementCount).toBe(GPU_META_STRIDE);
  });
});
