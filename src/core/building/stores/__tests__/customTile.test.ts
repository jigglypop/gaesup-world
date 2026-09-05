import { useBuildingStore } from '../buildingStore';

const INITIAL_STATE = useBuildingStore.getState();

beforeEach(() => useBuildingStore.setState(INITIAL_STATE, true));
afterEach(() => useBuildingStore.setState(INITIAL_STATE, true));

function applyTile(name: string, textureUrl = '') {
  const store = useBuildingStore.getState();
  store.setCustomTileDraft({ name, color: '#8f8f8f', textureUrl });
  store.applyCustomTile();
  return useBuildingStore.getState().selectedTileGroupId;
}

test('keeps Korean names distinct and reuses an identical draft', () => {
  const wood = applyTile('나무');
  const marble = applyTile('대리석');
  expect(wood).not.toBe(marble);
  expect(applyTile('나무')).toBe(wood);
  const groups = useBuildingStore.getState().tileGroups;
  expect(groups.get(wood!)?.name).toBe('나무');
  expect(groups.get(marble!)?.name).toBe('대리석');
});

test('preserves separate textures with a long shared URL prefix through save and load', () => {
  const prefix = `https://example.com/${'texture-path/'.repeat(8)}`;
  const first = applyTile('바닥', `${prefix}first.png`);
  const second = applyTile('바닥', `${prefix}second.png`);
  expect(first).not.toBe(second);
  const snapshot = useBuildingStore.getState().serialize();
  useBuildingStore.setState(INITIAL_STATE, true);
  useBuildingStore.getState().hydrate(snapshot);
  const store = useBuildingStore.getState();
  for (const [id, url] of [[first, `${prefix}first.png`], [second, `${prefix}second.png`]]) {
    const group = store.tileGroups.get(id!);
    expect(store.meshes.get(group!.floorMeshId!)?.mapTextureUrl).toBe(url);
  }
});

test('retains legacy custom tile IDs on hydration', () => {
  const meshId = 'custom-tile-8f8f8f-color';
  const groupId = 'custom-tile-group-8f8f8f-color';
  useBuildingStore.getState().hydrate({
    version: 1,
    meshes: [{ id: meshId, color: '#8f8f8f', material: 'STANDARD' }],
    tileGroups: [{ id: groupId, name: '나무', floorMeshId: meshId, tiles: [] }],
  });
  applyTile('대리석');
  expect(useBuildingStore.getState().tileGroups.get(groupId)?.floorMeshId).toBe(meshId);
  expect(useBuildingStore.getState().serialize().tileGroups).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: groupId, name: '나무' }),
  ]));
});
