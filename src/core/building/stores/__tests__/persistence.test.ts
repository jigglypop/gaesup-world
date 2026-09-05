import {
  hydrateBuildingState,
  serializeBuildingState,
  type BuildingHydrationTarget,
} from '../persistence';
import type { BuildingSerializedState } from '../../types';
import { useBuildingStore } from '../buildingStore';

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
  it.each([NaN, Infinity, -Infinity, null, '1'])('rejects invalid coordinates before cloning: %s', (coordinate) => {
    for (const field of ['x', 'y', 'z']) {
      const position = { x: 0, y: 0, z: 0, [field]: coordinate };
      for (const data of [
        { tileGroups: [{ id: 'tiles', tiles: [{ id: 'tile', position }] }] },
        { wallGroups: [{ id: 'walls', walls: [{ id: 'wall', position, rotation: { x: 0, y: 0, z: 0 } }] }] },
        { blocks: [{ id: 'block', position }] },
        { objects: [{ id: 'object', type: 'fire', position }] },
      ]) {
        const previous = useBuildingStore.getState();
        expect(() => previous.prepareHydrate(data as unknown as BuildingSerializedState)).toThrow(RangeError);
        expect(useBuildingStore.getState()).toBe(previous);
      }
    }
  });

  it.each([0, -1, NaN, Infinity, null])('rejects invalid tile and block dimensions: %s', (size) => {
    const position = { x: 0, y: 0, z: 0 };
    for (const data of [
      { tileGroups: [{ id: 'tiles', tiles: [{ id: 'tile', position, size }] }] },
      { blocks: [{ id: 'block', position, size: { y: size } }] },
    ]) {
      const previous = useBuildingStore.getState();
      expect(() => previous.prepareHydrate(data as unknown as BuildingSerializedState)).toThrow(RangeError);
      expect(useBuildingStore.getState()).toBe(previous);
    }
  });

  it('prepares an owned building snapshot without changing the live store', () => {
    const previous = useBuildingStore.getState();
    const listener = jest.fn();
    const unsubscribe = useBuildingStore.subscribe(listener);
    try {
      const data: Partial<BuildingSerializedState> = { objects: [{ id: 'fire', type: 'fire', position: { x: 1, y: 0, z: 0 } }] };
      const apply = previous.prepareHydrate(data);
      expect(useBuildingStore.getState()).toBe(previous);
      expect(listener).not.toHaveBeenCalled();
      expect(Object.isFrozen(data.objects![0]!.position)).toBe(false);
      data.objects![0]!.position.x = 99;
      useBuildingStore.setState({ editMode: 'wall' });
      apply();
      expect(useBuildingStore.getState().objects[0]!.position.x).toBe(1);
      expect(useBuildingStore.getState().editMode).toBe('wall');
    } finally {
      unsubscribe();
      useBuildingStore.setState(previous, true);
    }
  });

  it.each([{ x: 1e20, size: 1 }, { x: 0, size: 1000 }])('preserves the store when spatial work is rejected: %j', ({ x, size }) => {
    const previous = useBuildingStore.getState();
    try {
      useBuildingStore.setState({ meshes: new Map([['existing', { id: 'existing', color: '#fff', material: 'STANDARD' }]]) });
      const before = useBuildingStore.getState();
      expect(() => before.hydrate({ tileGroups: [{
        id: 'tiles', name: 'Tiles', floorMeshId: 'existing',
        tiles: [{ id: 'tile', tileGroupId: 'tiles', position: { x, y: 0, z: 0 }, size }],
      }] })).toThrow(RangeError);
      expect(useBuildingStore.getState()).toBe(before);
      expect(useBuildingStore.getState().meshes.has('existing')).toBe(true);
    } finally {
      useBuildingStore.setState(previous, true);
    }
  });

  it.each([
    {}, { version: 1 }, { unexpected: true }, [], 'invalid', false,
    { version: 2, meshes: [] }, { meshes: {} }, { blocks: null },
    { meshes: [], objects: 'invalid' }, { meshes: [], showFog: 'false' },
    { meshes: [], weatherEffect: 'unknown' }, { meshes: [], worldSurface: 'unknown' },
  ])('rejects malformed envelopes before changing existing buildings: %j', (invalid) => {
    const target = createTarget();
    target.meshes.set('existing', { id: 'existing', color: '#fff', material: 'STANDARD' });
    const before = serializeBuildingState(target);
    expect(() => hydrateBuildingState(target, invalid as unknown as BuildingSerializedState)).toThrow();
    expect(serializeBuildingState(target)).toEqual(before);
    expect(target.initialized).toBe(false);
  });

  it('accepts explicit empty collections and legacy partial snapshots', () => {
    const target = createTarget();
    target.meshes.set('existing', { id: 'existing', color: '#fff', material: 'STANDARD' });
    hydrateBuildingState(target, { meshes: [] });
    expect(target.meshes.size).toBe(0);
    hydrateBuildingState(target, { worldSurface: 'water' });
    expect(target.worldSurface).toBe('water');
  });

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
