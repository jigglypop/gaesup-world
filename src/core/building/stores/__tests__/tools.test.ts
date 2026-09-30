import { createBuildingStore } from '../buildingStore';

function island() {
  const store = createBuildingStore();
  store.getState().hydrate({
    version: 1,
    meshes: [{ id: 'lawn', color: '#8ccd65' }, { id: 'planks', color: '#d3a36a' }],
    tileGroups: [{ id: 'ground', name: 'ground', floorMeshId: 'lawn', tiles: [{ id: 'tile-a', tileGroupId: 'ground', size: 1, position: { x: 0, y: 0, z: 0 } }] }],
    wallGroups: [{ id: 'room', name: 'room', frontMeshId: 'planks', backMeshId: 'planks', sideMeshId: 'planks', walls: [{ id: 'wall-a', wallGroupId: 'room', position: { x: 0, y: 0, z: -2 }, rotation: { x: 0, y: 0, z: 0 } }] }],
    objects: [{ id: 'chair', type: 'model', position: { x: 1, y: 0, z: 1 } }],
  });
  return store;
}

describe('building tools', () => {
  it('erases the piece of the current edit mode and does nothing while placing', () => {
    const store = island();
    const state = () => store.getState();
    state().setEditMode('object');
    state().applyToolTo('chair');
    expect(state().objects).toHaveLength(1);

    state().setBuildingTool('erase');
    state().applyToolTo('chair');
    expect(state().objects).toHaveLength(0);

    state().setEditMode('tile');
    state().applyToolTo('tile-a');
    expect(state().tileGroups.get('ground')!.tiles).toHaveLength(0);

    state().setEditMode('wall');
    state().applyToolTo('wall-a');
    expect(state().wallGroups.get('room')!.walls).toHaveLength(0);
  });

  it('paints a tile with the current floor and ground cover', () => {
    const store = island();
    const state = () => store.getState();
    state().setEditMode('tile');
    state().setBuildingTool('paint');
    state().setCurrentTileMaterialId('planks');
    state().setSelectedTileObjectType('dirt');
    state().applyToolTo('tile-a');
    const tile = state().tileGroups.get('ground')!.tiles[0]!;
    expect(tile.materialId).toBe('planks');
    expect(tile.objectType).toBe('dirt');
    expect(tile.objectConfig?.terrainColor).toBeDefined();
  });

  it('switching tools drops the selection, and leaving edit mode takes the grid away', () => {
    const store = island();
    const state = () => store.getState();
    state().setEditMode('tile');
    state().setSelectedTileId('tile-a');
    expect(state().showGrid).toBe(true);
    state().setBuildingTool('erase');
    expect(state().selectedTileId).toBeNull();
    state().setEditMode('none');
    expect(state().showGrid).toBe(false);
  });
});
