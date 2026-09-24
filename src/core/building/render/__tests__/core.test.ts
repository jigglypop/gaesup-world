import type { BuildingBlockConfig, PlacedObject, TileGroupConfig, WallGroupConfig } from '../../types';
import { collectCandidateIds, createVisibilityIndex } from '../../visibility/core';
import {
  buildBuildingRenderSnapshot,
  createBuildingRenderSnapshotBuilder,
  RENDER_KIND_OBJECT,
  RENDER_KIND_BLOCK,
  RENDER_KIND_TILE,
  RENDER_KIND_WALL,
  syncVisibilityIndex,
} from '../core';

describe('building render snapshot core', () => {
  it('builds a SoA render snapshot from building groups and objects', () => {
    const wallGroups: WallGroupConfig[] = [
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
    ];
    const tileGroups: TileGroupConfig[] = [
      {
        id: 'tiles',
        name: 'Tiles',
        floorMeshId: 'wood-floor',
        tiles: [{ id: 't1', tileGroupId: 'tiles', position: { x: 2, y: 0, z: 2 }, size: 1 }],
      },
    ];
    const objects: PlacedObject[] = [
      { id: 'o1', type: 'fire', position: { x: 4, y: 0, z: 4 } },
    ];
    const blocks: BuildingBlockConfig[] = [
      { id: 'b1', position: { x: 8, y: 0, z: 8 }, size: { x: 1, y: 2, z: 1 }, materialId: 'stone' },
    ];

    const snapshot = buildBuildingRenderSnapshot({
      wallGroups,
      tileGroups,
      blocks,
      objects,
      version: 7,
    });

    expect(snapshot.version).toBe(7);
    expect(snapshot.ids).toEqual(['tiles', 'walls', 'b1', 'o1']);
    expect(Array.from(snapshot.kinds)).toEqual([RENDER_KIND_TILE, RENDER_KIND_WALL, RENDER_KIND_BLOCK, RENDER_KIND_OBJECT]);
    expect(snapshot.centerX.length).toBe(4);
    expect(snapshot.memberCount[0]).toBe(1);
  });

  it('converts a render snapshot back into a visibility index', () => {
    const snapshot = buildBuildingRenderSnapshot({
      wallGroups: [],
      tileGroups: [
        {
          id: 'tiles',
          name: 'Tiles',
          floorMeshId: 'wood-floor',
          tiles: [{ id: 't1', tileGroupId: 'tiles', position: { x: 2, y: 0, z: 2 }, size: 1 }],
        },
      ],
      blocks: [{ id: 'b1', position: { x: 8, y: 0, z: 8 }, size: { x: 1, y: 2, z: 1 } }],
      objects: [{ id: 'o1', type: 'fire', position: { x: 4, y: 0, z: 4 } }],
      version: 1,
    });

    const index = createVisibilityIndex();
    syncVisibilityIndex(index, snapshot);

    expect(index.tile.byId.has('tiles')).toBe(true);
    expect(index.block.byId.has('b1')).toBe(true);
    expect(index.object.byId.has('o1')).toBe(true);
    expect(index.wall.byId.size).toBe(0);
  });
});

describe('incremental render snapshot builder', () => {
  const group = (id: string, x: number): TileGroupConfig => ({
    id, name: id, floorMeshId: 'floor',
    tiles: [{ id: `${id}-t`, tileGroupId: id, position: { x, y: 0, z: 0 }, size: 1 }],
  });

  it('reuses records of unchanged configs and recomputes replaced ones', () => {
    const build = createBuildingRenderSnapshotBuilder();
    const kept = group('kept', 0);
    const edited = group('edited', 10);
    const first = build({ wallGroups: [], tileGroups: [kept, edited], objects: [] }, 1);
    // An in-place change is invisible to the cache; only a new identity (what immer produces) is recomputed.
    kept.tiles[0]!.position.x = 500;
    const replaced = { ...edited, tiles: [...edited.tiles, { ...edited.tiles[0]!, id: 'extra', position: { x: 12, y: 0, z: 0 } }] };
    const second = build({ wallGroups: [], tileGroups: [kept, replaced], objects: [] }, 2);

    expect(second.version).toBe(2);
    expect(second.centerX[0]).toBe(first.centerX[0]);
    expect(second.centerX[1]).toBeGreaterThan(first.centerX[1]!);
    expect(second.memberCount[1]).toBe(2);
    expect(Array.from(second.centerX)).not.toEqual(Array.from(buildBuildingRenderSnapshot({
      wallGroups: [], tileGroups: [kept, replaced], objects: [], version: 2,
    }).centerX));
  });

  it('drops removed and emptied groups', () => {
    const build = createBuildingRenderSnapshotBuilder();
    const a = group('a', 0);
    build({ wallGroups: [], tileGroups: [a, group('b', 5)], objects: [] }, 1);
    const next = build({ wallGroups: [], tileGroups: [{ ...a, tiles: [] }], objects: [{ id: 'o', type: 'flag', position: { x: 0, y: 0, z: 0 } }] }, 2);
    expect(next.ids).toEqual(['o']);
  });
});

describe('incremental visibility index', () => {
  const tiles = (id: string, xs: number[]): TileGroupConfig => ({
    id, name: id, floorMeshId: 'floor',
    tiles: xs.map((x, i) => ({ id: `${id}-${i}`, tileGroupId: id, position: { x, y: 0, z: 0 }, size: 1 })),
  });

  it('re-buckets only changed entities and drops removed ones', () => {
    const build = createBuildingRenderSnapshotBuilder();
    const index = createVisibilityIndex();
    const near = tiles('near', [0]);
    syncVisibilityIndex(index, build({ wallGroups: [], tileGroups: [near, tiles('moving', [0])], objects: [{ id: 'o', type: 'fire', position: { x: 0, y: 0, z: 0 } }] }, 1));
    const kept = index.tile.byId.get('near');

    syncVisibilityIndex(index, build({ wallGroups: [], tileGroups: [near, tiles('moving', [400])], objects: [] }, 2));

    expect(index.tile.byId.get('near')).toBe(kept);
    expect(collectCandidateIds(index.tile.buckets, 0, 0)).toEqual(new Set(['near']));
    expect(collectCandidateIds(index.tile.buckets, 400, 0)).toEqual(new Set(['moving']));
    expect(index.object.byId.size).toBe(0);
    expect(index.object.buckets.cells.size).toBe(0);
  });

  it('toggles occluders with group size and keeps oversized records as constant candidates', () => {
    const build = createBuildingRenderSnapshotBuilder();
    const index = createVisibilityIndex();
    syncVisibilityIndex(index, build({ wallGroups: [], tileGroups: [tiles('floor', [0])], objects: [] }, 1));
    expect(index.occluders.byKey.has('tile:floor')).toBe(false);
    syncVisibilityIndex(index, build({ wallGroups: [], tileGroups: [tiles('floor', [0, 8])], objects: [] }, 2));
    expect(index.occluders.byKey.has('tile:floor')).toBe(true);

    syncVisibilityIndex(index, build({ wallGroups: [], tileGroups: [tiles('floor', [0]), tiles('huge', [-5000, 5000])], objects: [] }, 3));
    expect(index.occluders.byKey.has('tile:floor')).toBe(false);
    expect(index.tile.buckets.unbounded).toEqual(new Set(['huge']));
    expect(collectCandidateIds(index.tile.buckets, 2000, 2000).has('huge')).toBe(true);
    syncVisibilityIndex(index, build({ wallGroups: [], tileGroups: [], objects: [] }, 4));
    expect(index.tile.buckets.unbounded.size).toBe(0);
    expect(index.occluders.buckets.unbounded.size).toBe(0);
  });
});
