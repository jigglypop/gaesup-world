import {
  hydrateBuildingState,
  serializeBuildingState,
  type BuildingHydrationTarget,
} from '../persistence';
import type { BuildingSerializedState } from '../../types';

function createTarget(): BuildingHydrationTarget {
  return {
    meshes: new Map(),
    wallGroups: new Map(),
    tileGroups: new Map(),
    blocks: [],
    objects: [],
    tileIndex: new Map(),
    tileCells: new Map(),
    tileMeta: new Map(),
    wallIndex: new Map(),
    wallCells: new Map(),
    wallMeta: new Map(),
    initialized: false,
    showSnow: false,
    showFog: false,
    fogColor: '#cfd8e3',
    weatherEffect: 'none',
  };
}

describe('building persistence helpers', () => {
  it('serializes maps and arrays without exposing mutable block and object references', () => {
    const target = createTarget();
    target.meshes.set('mesh', { id: 'mesh', color: '#fff', material: 'STANDARD' });
    target.wallGroups.set('walls', { id: 'walls', name: 'Walls', meshId: 'mesh', walls: [] });
    target.tileGroups.set('tiles', { id: 'tiles', name: 'Tiles', floorMeshId: 'mesh', tiles: [] });
    target.blocks.push({ id: 'block', position: { x: 0, y: 0, z: 0 } });
    target.objects.push({ id: 'object', type: 'fire', position: { x: 1, y: 0, z: 1 } });

    const snapshot = serializeBuildingState(target);
    target.blocks[0]!.position.x = 99;
    target.objects[0]!.position.x = 99;

    expect(snapshot).toEqual({
      version: 1,
      meshes: [{ id: 'mesh', color: '#fff', material: 'STANDARD' }],
      wallGroups: [{ id: 'walls', name: 'Walls', meshId: 'mesh', walls: [] }],
      tileGroups: [{ id: 'tiles', name: 'Tiles', floorMeshId: 'mesh', tiles: [] }],
      blocks: [{ id: 'block', position: { x: 0, y: 0, z: 0 } }],
      objects: [{ id: 'object', type: 'fire', position: { x: 1, y: 0, z: 1 } }],
      showSnow: false,
      showFog: false,
      fogColor: '#cfd8e3',
      weatherEffect: 'none',
    });
  });

  it('hydrates legacy tile wall and block coordinates and rebuilds spatial indexes', () => {
    const target = createTarget();
    const data: BuildingSerializedState = {
      version: 1,
      meshes: [],
      tileGroups: [
        {
          id: 'tiles',
          name: 'Tiles',
          floorMeshId: 'mesh',
          tiles: [
            {
              id: 'tile',
              position: { x: 8, y: 2, z: 12 },
              tileGroupId: 'tiles',
              size: 2,
            },
          ],
        },
      ],
      wallGroups: [
        {
          id: 'walls',
          name: 'Walls',
          meshId: 'mesh',
          walls: [
            {
              id: 'wall',
              position: { x: 2, y: 0, z: -2 },
              rotation: { x: 0, y: 0, z: 0 },
              wallGroupId: 'walls',
            },
          ],
        },
      ],
      blocks: [
        {
          id: 'block',
          position: { x: 12, y: 1, z: 12 },
        },
      ],
      objects: [],
      showSnow: false,
      showFog: false,
      fogColor: '#cfd8e3',
      weatherEffect: 'none',
    };

    hydrateBuildingState(target, data);

    const tile = target.tileGroups.get('tiles')?.tiles[0];
    const wall = target.wallGroups.get('walls')?.walls[0];
    const block = target.blocks[0];

    expect(target.initialized).toBe(true);
    expect(tile?.cell).toEqual({ x: 2, z: 3, level: 2 });
    expect(tile?.footprint).toEqual([
      { x: 1, z: 2, level: 2 },
      { x: 1, z: 3, level: 2 },
      { x: 2, z: 2, level: 2 },
      { x: 2, z: 3, level: 2 },
    ]);
    expect(target.tileMeta.get('tile')).toEqual({ x: 8, y: 2, z: 12, halfSize: 4 });
    expect(target.tileCells.get('tile')?.length).toBeGreaterThan(0);
    expect(wall?.edge).toEqual({ x: 0, z: 0, level: 0, side: 'east' });
    expect(target.wallMeta.get('wall')).toEqual({ x: 2, z: -2, rotY: 0 });
    expect(target.wallCells.get('wall')?.length).toBeGreaterThan(0);
    expect(block?.cell).toEqual({ x: 3, z: 3, level: 1 });
  });

  it('ignores empty hydrate payloads without clearing current state', () => {
    const target = createTarget();
    target.meshes.set('mesh', { id: 'mesh', color: '#fff', material: 'STANDARD' });

    hydrateBuildingState(target, null);
    hydrateBuildingState(target, undefined);

    expect(target.meshes.has('mesh')).toBe(true);
    expect(target.initialized).toBe(false);
  });
});
