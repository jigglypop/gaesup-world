import {
  buildBuildingRenderSnapshot,
  RENDER_KIND_BLOCK,
  RENDER_KIND_OBJECT,
  RENDER_KIND_TILE,
  RENDER_KIND_WALL,
  RENDER_SUBKIND_OBJECT_FIRE,
  RENDER_SUBKIND_TILE_GRASS,
  type BuildingRenderSnapshot,
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

  it('parses large visibility buffers within a frame-budget smoke threshold', () => {
    const count = 20_000;
    const ids = Array.from({ length: count }, (_, index) => `entity-${index}`);
    const kinds = new Uint8Array(count);
    const subKinds = new Uint8Array(count);
    const flags = new Uint32Array(count);

    for (let i = 0; i < count; i += 1) {
      const kindIndex = i % 4;
      kinds[i] =
        kindIndex === 0 ? RENDER_KIND_TILE :
        kindIndex === 1 ? RENDER_KIND_WALL :
        kindIndex === 2 ? RENDER_KIND_OBJECT :
                          RENDER_KIND_BLOCK;
      subKinds[i] = kindIndex === 0 ? RENDER_SUBKIND_TILE_GRASS : RENDER_SUBKIND_OBJECT_FIRE;
      flags[i] = i % 3 === 0 ? 1 : 0;
    }

    const snapshot: BuildingRenderSnapshot = {
      version: 9,
      ids,
      kinds,
      subKinds,
      centerX: new Float32Array(count),
      centerY: new Float32Array(count),
      centerZ: new Float32Array(count),
      radius: new Float32Array(count),
      cellX: new Int16Array(count),
      cellZ: new Int16Array(count),
      memberCount: new Uint16Array(count),
    };

    const startedAt = performance.now();
    const parsed = parseBuildingGpuVisibilityFlags(snapshot, flags);
    const elapsedMs = performance.now() - startedAt;

    expect(parsed.version).toBe(9);
    expect(parsed.tileIds.size + parsed.wallIds.size + parsed.objectIds.size + parsed.blockIds.size)
      .toBe(Math.ceil(count / 3));
    expect(parsed.clusterCounts[DRAW_CLUSTER_GRASS]).toBeGreaterThan(0);
    expect(parsed.clusterCounts[DRAW_CLUSTER_FIRE]).toBeGreaterThan(0);
    expect(elapsedMs).toBeLessThan(500);
  });
});
