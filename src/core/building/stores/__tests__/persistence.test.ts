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
    worldSurface: 'ground',
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
      worldSurface: 'ground',
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
      worldSurface: 'water',
    };

    hydrateBuildingState(target, data);

    const tile = target.tileGroups.get('tiles')?.tiles[0];
    const wall = target.wallGroups.get('walls')?.walls[0];
    const block = target.blocks[0];

    expect(target.initialized).toBe(true);
    expect(target.worldSurface).toBe('water');
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

  it('hydrate 후 존재하지 않는 선택 그룹은 첫 그룹으로 대체된다', () => {
    const target = createTarget();
    target.selectedTileGroupId = 'oak-floor';
    target.selectedWallGroupId = 'brick-walls';

    hydrateBuildingState(target, {
      version: 1,
      meshes: [],
      tileGroups: [
        { id: 'custom-floor', name: 'Custom', floorMeshId: 'mesh', tiles: [] },
        { id: 'second-floor', name: 'Second', floorMeshId: 'mesh', tiles: [] },
      ],
      wallGroups: [{ id: 'custom-walls', name: 'Custom Walls', meshId: 'mesh', walls: [] }],
      blocks: [],
      objects: [],
      showSnow: false,
      showFog: false,
      fogColor: '#cfd8e3',
      weatherEffect: 'none',
      worldSurface: 'ground',
    });

    expect(target.selectedTileGroupId).toBe('custom-floor');
    expect(target.selectedWallGroupId).toBe('custom-walls');
  });

  it('hydrate 후 선택 그룹이 유효하면 그대로 유지된다', () => {
    const target = createTarget();
    target.selectedTileGroupId = 'oak-floor';
    target.selectedWallGroupId = 'brick-walls';

    hydrateBuildingState(target, {
      version: 1,
      meshes: [],
      tileGroups: [
        { id: 'other-floor', name: 'Other', floorMeshId: 'mesh', tiles: [] },
        { id: 'oak-floor', name: 'Oak', floorMeshId: 'mesh', tiles: [] },
      ],
      wallGroups: [{ id: 'brick-walls', name: 'Brick', meshId: 'mesh', walls: [] }],
      blocks: [],
      objects: [],
      showSnow: false,
      showFog: false,
      fogColor: '#cfd8e3',
      weatherEffect: 'none',
      worldSurface: 'ground',
    });

    expect(target.selectedTileGroupId).toBe('oak-floor');
    expect(target.selectedWallGroupId).toBe('brick-walls');
  });

  it('hydrate된 그룹이 하나도 없으면 선택 그룹이 해제된다', () => {
    const target = createTarget();
    target.selectedTileGroupId = 'oak-floor';
    target.selectedWallGroupId = 'brick-walls';

    hydrateBuildingState(target, {
      version: 1,
      meshes: [],
      tileGroups: [],
      wallGroups: [],
      blocks: [],
      objects: [],
      showSnow: false,
      showFog: false,
      fogColor: '#cfd8e3',
      weatherEffect: 'none',
      worldSurface: 'ground',
    });

    expect(target.selectedTileGroupId).toBeUndefined();
    expect(target.selectedWallGroupId).toBeUndefined();
  });
});
