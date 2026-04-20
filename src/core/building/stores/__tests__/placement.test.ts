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
});

