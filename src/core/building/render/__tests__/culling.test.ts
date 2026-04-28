import {
  buildBuildingRenderSnapshot,
  RENDER_SUBKIND_OBJECT_FIRE,
  RENDER_SUBKIND_TILE_GRASS,
} from '../core';
import {
  DRAW_CLUSTER_BLOCK,
  DRAW_CLUSTER_FIRE,
  DRAW_CLUSTER_GRASS,
  parseBuildingGpuVisibilityFlags,
} from '../culling';

describe('building gpu culling parse', () => {
  it('maps visible flags back to tile, wall and object id sets', () => {
    const snapshot = buildBuildingRenderSnapshot({
      wallGroups: [
        {
          id: 'walls',
          name: 'Walls',
          walls: [
            {
              id: 'w1',
              wallGroupId: 'walls',
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
            },
          ],
        },
      ],
      tileGroups: [
        {
          id: 'tiles',
          name: 'Tiles',
          floorMeshId: 'wood-floor',
          tiles: [{ id: 't1', tileGroupId: 'tiles', position: { x: 2, y: 0, z: 2 }, size: 1, objectType: 'grass' }],
        },
      ],
      blocks: [{ id: 'b1', position: { x: 8, y: 0, z: 8 } }],
      objects: [{ id: 'o1', type: 'fire', position: { x: 4, y: 0, z: 4 } }],
      version: 5,
    });

    const parsed = parseBuildingGpuVisibilityFlags(snapshot, new Uint32Array([1, 0, 1, 1]));

    expect(parsed.version).toBe(5);
    expect(parsed.tileIds.has('tiles')).toBe(true);
    expect(parsed.wallIds.size).toBe(0);
    expect(parsed.blockIds.has('b1')).toBe(true);
    expect(parsed.objectIds.has('o1')).toBe(true);
    expect(parsed.clusterCounts[DRAW_CLUSTER_GRASS]).toBe(1);
    expect(parsed.clusterCounts[DRAW_CLUSTER_BLOCK]).toBe(1);
    expect(parsed.clusterCounts[DRAW_CLUSTER_FIRE]).toBe(1);
    expect(snapshot.subKinds[0]).toBe(RENDER_SUBKIND_TILE_GRASS);
    expect(snapshot.subKinds[3]).toBe(RENDER_SUBKIND_OBJECT_FIRE);
  });
});
