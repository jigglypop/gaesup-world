import { createBuildingStore } from '../buildingStore';

describe('building spatial index', () => {
  it('prepareHydrate fills a separate index and swaps it in only when applied', () => {
    const store = createBuildingStore();
    store.getState().initializeDefaults();
    const live = store.getState().spatialIndex;
    const liveTiles = live.tileMeta.size;
    expect(liveTiles).toBeGreaterThan(0);

    const apply = store.getState().prepareHydrate({ tileGroups: [], wallGroups: [], meshes: [] });
    expect(store.getState().spatialIndex).toBe(live);
    expect(live.tileMeta.size).toBe(liveTiles);

    apply();
    expect(store.getState().spatialIndex).not.toBe(live);
    expect(store.getState().spatialIndex.tileMeta.size).toBe(0);
  });

  it('keeps the same index instance across edits and indexes new tiles in place', () => {
    const store = createBuildingStore();
    store.getState().initializeDefaults();
    const index = store.getState().spatialIndex;
    const groupId = store.getState().selectedTileGroupId!;
    store.getState().addTile(groupId, { id: 'probe', position: { x: 400, y: 0, z: 400 }, tileGroupId: groupId, size: 1 });
    expect(store.getState().spatialIndex).toBe(index);
    expect(index.tileMeta.get('probe')).toMatchObject({ x: 400, z: 400 });
    expect(store.getState().checkTilePosition({ x: 400, y: 0, z: 400 })).toBe(true);
    store.getState().removeTile(groupId, 'probe');
    expect(index.tileMeta.has('probe')).toBe(false);
  });
});
