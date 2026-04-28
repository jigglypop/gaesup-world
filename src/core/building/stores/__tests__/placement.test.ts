import { useBuildingStore } from '../buildingStore';

describe('buildingStore placement checks', () => {
  const FAR = 1000;

  beforeEach(() => {
    const s = useBuildingStore.getState();
    s.initializeDefaults();
    s.setTileMultiplier(1);
  });

  test('checkTilePosition detects overlap and respects removal', () => {
    const s = useBuildingStore.getState();
    const groupId = s.selectedTileGroupId;
    expect(groupId).toBeDefined();
    if (!groupId) return;

    const tileId = `test-tile-${Date.now()}`;
    const pos = { x: FAR, y: 0, z: FAR };

    expect(s.checkTilePosition(pos)).toBe(false);

    s.addTile(groupId, {
      id: tileId,
      position: pos,
      tileGroupId: groupId,
      size: 1,
    });

    expect(s.checkTilePosition(pos)).toBe(true);
    expect(s.checkTilePosition({ x: FAR + 4, y: 0, z: FAR })).toBe(false); // adjacent cell should not overlap (size=1)

    s.removeTile(groupId, tileId);
    expect(s.checkTilePosition(pos)).toBe(false);
  });

  test('addTile derives CellCoord and footprint migration metadata', () => {
    const s = useBuildingStore.getState();
    const groupId = s.selectedTileGroupId;
    expect(groupId).toBeDefined();
    if (!groupId) return;

    const tileId = `cell-tile-${Date.now()}`;
    s.addTile(groupId, {
      id: tileId,
      position: { x: FAR + 8, y: 2, z: FAR - 4 },
      tileGroupId: groupId,
      size: 2,
    });

    const tile = useBuildingStore.getState().tileGroups.get(groupId)?.tiles.find((entry) => entry.id === tileId);
    expect(tile?.cell).toEqual({ x: 252, z: 249, level: 2 });
    expect(tile?.footprint).toEqual([
      { x: 251, z: 248, level: 2 },
      { x: 251, z: 249, level: 2 },
      { x: 252, z: 248, level: 2 },
      { x: 252, z: 249, level: 2 },
    ]);

    s.updateTile(groupId, tileId, {
      position: { x: FAR + 12, y: 3, z: FAR - 4 },
      size: 1,
    });

    const updated = useBuildingStore.getState().tileGroups.get(groupId)?.tiles.find((entry) => entry.id === tileId);
    expect(updated?.cell).toEqual({ x: 253, z: 249, level: 3 });
    expect(updated?.footprint).toEqual([
      { x: 253, z: 249, level: 3 },
    ]);

    s.removeTile(groupId, tileId);
  });

  test('updateTile can assign a per-tile material without changing its group mesh', () => {
    const s = useBuildingStore.getState();
    const groupId = s.selectedTileGroupId;
    expect(groupId).toBeDefined();
    if (!groupId) return;

    const beforeGroupMesh = s.tileGroups.get(groupId)?.floorMeshId;
    const tileId = `material-tile-${Date.now()}`;
    s.addTile(groupId, {
      id: tileId,
      position: { x: FAR + 16, y: 0, z: FAR },
      tileGroupId: groupId,
      size: 1,
    });

    s.updateTile(groupId, tileId, { materialId: 'tile-only-material' });

    const state = useBuildingStore.getState();
    const group = state.tileGroups.get(groupId);
    const tile = group?.tiles.find((entry) => entry.id === tileId);
    expect(group?.floorMeshId).toBe(beforeGroupMesh);
    expect(tile?.materialId).toBe('tile-only-material');

    s.removeTile(groupId, tileId);
  });

  test('addTile applies currentTileMaterialId only to the new tile', () => {
    const s = useBuildingStore.getState();
    const groupId = s.selectedTileGroupId;
    expect(groupId).toBeDefined();
    if (!groupId) return;

    const beforeGroupMesh = s.tileGroups.get(groupId)?.floorMeshId;
    s.setCurrentTileMaterialId('next-tile-material');

    const tileId = `current-material-tile-${Date.now()}`;
    s.addTile(groupId, {
      id: tileId,
      position: { x: FAR + 20, y: 0, z: FAR },
      tileGroupId: groupId,
      size: 1,
    });

    const state = useBuildingStore.getState();
    const group = state.tileGroups.get(groupId);
    const tile = group?.tiles.find((entry) => entry.id === tileId);
    expect(group?.floorMeshId).toBe(beforeGroupMesh);
    expect(tile?.materialId).toBe('next-tile-material');

    s.setCurrentTileMaterialId(null);
    s.removeTile(groupId, tileId);
  });

  test('checkTilePosition accounts for currentTileMultiplier', () => {
    const s = useBuildingStore.getState();
    const groupId = s.selectedTileGroupId;
    expect(groupId).toBeDefined();
    if (!groupId) return;

    const tileId = `test-tile-${Date.now()}`;
    const existingPos = { x: FAR, y: 0, z: FAR };
    s.addTile(groupId, {
      id: tileId,
      position: existingPos,
      tileGroupId: groupId,
      size: 1,
    });

    // Size=1 placement at +4 should not overlap (see previous test)
    s.setTileMultiplier(1);
    expect(s.checkTilePosition({ x: FAR + 4, y: 0, z: FAR })).toBe(false);

    // Size=2 placement at +4 should overlap (halfSize 4 vs existing halfSize 2)
    s.setTileMultiplier(2);
    expect(s.checkTilePosition({ x: FAR + 4, y: 0, z: FAR })).toBe(true);

    s.removeTile(groupId, tileId);
  });

  test('checkTilePosition allows stacking on top (different Y) but blocks same Y', () => {
    const s = useBuildingStore.getState();
    const groupId = s.selectedTileGroupId;
    if (!groupId) return;

    const tileId = `stack-tile-${Date.now()}`;
    const groundPos = { x: FAR + 100, y: 0, z: FAR + 100 };
    s.addTile(groupId, {
      id: tileId,
      position: groundPos,
      tileGroupId: groupId,
      size: 1,
    });

    expect(s.checkTilePosition(groundPos)).toBe(true);
    expect(s.checkTilePosition({ x: groundPos.x, y: 1, z: groundPos.z })).toBe(false);
    expect(s.checkTilePosition({ x: groundPos.x, y: 2, z: groundPos.z })).toBe(false);

    s.removeTile(groupId, tileId);
  });

  test('getSupportHeightAt returns top of underlying tile', () => {
    const s = useBuildingStore.getState();
    const groupId = s.selectedTileGroupId;
    if (!groupId) return;

    const tileId = `support-tile-${Date.now()}`;
    const pos = { x: FAR + 200, y: 0, z: FAR + 200 };
    expect(s.getSupportHeightAt(pos)).toBe(0);

    s.addTile(groupId, {
      id: tileId,
      position: pos,
      tileGroupId: groupId,
      size: 1,
    });
    expect(s.getSupportHeightAt(pos)).toBe(1);

    const pos2 = { x: pos.x, y: 1, z: pos.z };
    s.addTile(groupId, {
      id: `${tileId}-up`,
      position: pos2,
      tileGroupId: groupId,
      size: 1,
    });
    expect(s.getSupportHeightAt(pos)).toBe(2);

    s.removeTile(groupId, tileId);
    s.removeTile(groupId, `${tileId}-up`);
  });

  test('block placement supports voxel-style add, stack, update, and removal', () => {
    const s = useBuildingStore.getState();
    const blockId = `block-${Date.now()}`;
    const pos = { x: FAR + 300, y: 0, z: FAR + 300 };

    expect(s.checkBlockPosition({ position: pos })).toBe(false);

    s.addBlock({
      id: blockId,
      position: pos,
      materialId: 'stone',
      tags: ['wall'],
    });

    const block = useBuildingStore.getState().blocks.find((entry) => entry.id === blockId);
    expect(block?.cell).toEqual({ x: 325, z: 325, level: 0 });
    expect(s.checkBlockPosition({ position: pos })).toBe(true);
    expect(s.checkBlockPosition({ position: { ...pos, y: 1 } })).toBe(false);

    s.updateBlock(blockId, {
      position: { x: pos.x + 4, y: 1, z: pos.z },
      size: { x: 1, y: 2, z: 1 },
    });

    const updated = useBuildingStore.getState().blocks.find((entry) => entry.id === blockId);
    expect(updated?.cell).toEqual({ x: 326, z: 325, level: 1 });
    expect(updated?.size).toEqual({ x: 1, y: 2, z: 1 });
    expect(s.checkBlockPosition({ position: { x: pos.x + 4, y: 2, z: pos.z } })).toBe(true);

    s.removeBlock(blockId);

    expect(useBuildingStore.getState().blocks.some((entry) => entry.id === blockId)).toBe(false);
    expect(s.checkBlockPosition({ position: { x: pos.x + 4, y: 1, z: pos.z } })).toBe(false);
  });

  test('block placement shares collision space with tiles', () => {
    const s = useBuildingStore.getState();
    const groupId = s.selectedTileGroupId;
    expect(groupId).toBeDefined();
    if (!groupId) return;

    const tileId = `block-tile-${Date.now()}`;
    const pos = { x: FAR + 400, y: 0, z: FAR + 400 };
    s.addTile(groupId, {
      id: tileId,
      position: pos,
      tileGroupId: groupId,
      size: 1,
    });

    expect(s.checkBlockPosition({ position: pos })).toBe(true);
    expect(s.checkBlockPosition({ position: { ...pos, y: 1 } })).toBe(false);

    s.removeTile(groupId, tileId);
  });

  test('checkWallPosition detects overlap and respects removal', () => {
    const s = useBuildingStore.getState();
    const groupId = s.selectedWallGroupId;
    expect(groupId).toBeDefined();
    if (!groupId) return;

    const wallId = `test-wall-${Date.now()}`;
    const pos = { x: FAR, y: 0, z: FAR };
    const rot = { x: 0, y: 0, z: 0 };

    expect(s.checkWallPosition(pos, rot.y)).toBe(false);

    s.addWall(groupId, {
      id: wallId,
      position: pos,
      rotation: rot,
      wallGroupId: groupId,
    });

    expect(s.checkWallPosition(pos, rot.y)).toBe(true);
    expect(s.checkWallPosition({ x: FAR + 1, y: 0, z: FAR }, rot.y)).toBe(false);

    s.removeWall(groupId, wallId);
    expect(s.checkWallPosition(pos, rot.y)).toBe(false);
  });

  test('addWall derives EdgeCoord migration metadata from legacy transform', () => {
    const s = useBuildingStore.getState();
    const groupId = s.selectedWallGroupId;
    expect(groupId).toBeDefined();
    if (!groupId) return;

    const wallId = `edge-wall-${Date.now()}`;
    s.addWall(groupId, {
      id: wallId,
      position: { x: -2, y: 0, z: -2 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      wallGroupId: groupId,
    });

    const wall = useBuildingStore.getState().wallGroups.get(groupId)?.walls.find((entry) => entry.id === wallId);
    expect(wall?.edge).toEqual({ x: 0, z: 0, level: 0, side: 'north' });

    s.updateWall(groupId, wallId, {
      position: { x: 2, y: 0, z: -2 },
      rotation: { x: 0, y: 0, z: 0 },
    });
    const updated = useBuildingStore.getState().wallGroups.get(groupId)?.walls.find((entry) => entry.id === wallId);
    expect(updated?.edge).toEqual({ x: 0, z: 0, level: 0, side: 'east' });

    s.removeWall(groupId, wallId);
  });

  test('serialize and hydrate preserve blocks and rebuild placement indexes', () => {
    const s = useBuildingStore.getState();
    const groupId = s.selectedTileGroupId;
    expect(groupId).toBeDefined();
    if (!groupId) return;

    const tileId = `persist-tile-${Date.now()}`;
    const blockId = `persist-block-${Date.now()}`;
    const tilePos = { x: FAR + 500, y: 0, z: FAR + 500 };
    const blockPos = { x: FAR + 504, y: 0, z: FAR + 500 };

    s.addTile(groupId, {
      id: tileId,
      position: tilePos,
      tileGroupId: groupId,
      size: 1,
    });
    s.addBlock({
      id: blockId,
      position: blockPos,
      size: { x: 1, y: 2, z: 1 },
      materialId: 'stone',
      tags: ['wall'],
    });
    s.addObject({
      id: `persist-object-${Date.now()}`,
      type: 'fire',
      position: { x: FAR + 508, y: 0, z: FAR + 500 },
    });

    const snapshot = s.serialize();
    expect(snapshot.blocks.some((block) => block.id === blockId)).toBe(true);
    expect(snapshot.objects.length).toBeGreaterThan(0);

    s.hydrate(snapshot);
    const hydrated = useBuildingStore.getState();

    expect(hydrated.blocks.find((block) => block.id === blockId)).toEqual(expect.objectContaining({
      id: blockId,
      cell: { x: 376, z: 375, level: 0 },
      materialId: 'stone',
      tags: ['wall'],
    }));
    expect(hydrated.checkTilePosition(tilePos)).toBe(true);
    expect(hydrated.checkBlockPosition({ position: blockPos })).toBe(true);
  });
});

