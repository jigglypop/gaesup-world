import {
  buildBuildingRenderSnapshot,
  buildVisibilityIndexFromRenderSnapshot,
  RENDER_KIND_OBJECT,
  RENDER_KIND_TILE,
  RENDER_KIND_WALL,
} from '../core';
import type { PlacedObject, TileGroupConfig, WallGroupConfig } from '../../types';

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

    const snapshot = buildBuildingRenderSnapshot({
      wallGroups,
      tileGroups,
      objects,
      version: 7,
    });

    expect(snapshot.version).toBe(7);
    expect(snapshot.ids).toEqual(['tiles', 'walls', 'o1']);
    expect(Array.from(snapshot.kinds)).toEqual([RENDER_KIND_TILE, RENDER_KIND_WALL, RENDER_KIND_OBJECT]);
    expect(snapshot.centerX.length).toBe(3);
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
      objects: [{ id: 'o1', type: 'fire', position: { x: 4, y: 0, z: 4 } }],
      version: 1,
    });

    const index = buildVisibilityIndexFromRenderSnapshot(snapshot);

    expect(index.tileById.has('tiles')).toBe(true);
    expect(index.objectById.has('o1')).toBe(true);
    expect(index.wallById.size).toBe(0);
  });
});
