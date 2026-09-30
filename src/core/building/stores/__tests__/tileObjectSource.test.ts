import type { TileConfig } from '../../types';
import { useBuildingStore } from '../buildingStore';

const FAR = 2000;

function addTileAt(id: string, x: number, extra: Partial<TileConfig> = {}): TileConfig | undefined {
  const store = useBuildingStore.getState();
  const groupId = store.selectedTileGroupId!;
  store.addTile(groupId, { id, position: { x: FAR + x, y: 0, z: FAR }, tileGroupId: groupId, size: 1, ...extra });
  return useBuildingStore.getState().tileGroups.get(groupId)?.tiles.find((tile) => tile.id === id);
}

beforeEach(() => {
  useBuildingStore.getState().initializeDefaults();
});

afterEach(() => {
  useBuildingStore.getState().setSelectedTileObjectType('none');
});

test('호출자가 넘긴 objectType과 objectConfig는 도구 상태로 덮어쓰지 않는다', () => {
  useBuildingStore.getState().setSelectedTileObjectType('grass');
  const tile = addTileAt(`restored-${Date.now()}`, 0, { objectType: 'water', objectConfig: { terrainColor: '#123456' } });
  expect(tile?.objectType).toBe('water');
  expect(tile?.objectConfig).toEqual({ terrainColor: '#123456' });
});

test('objectType만 넘기면 도구가 아닌 그 타입의 기본 설정을 쓴다', () => {
  useBuildingStore.getState().setSelectedTileObjectType('none');
  const state = useBuildingStore.getState();
  const tile = addTileAt(`typed-${Date.now()}`, 8, { objectType: 'grass' });
  expect(tile?.objectType).toBe('grass');
  expect(tile?.objectConfig).toEqual({
    grassDensity: 90,
    terrainColor: state.currentTerrainColor,
    terrainAccentColor: state.currentTerrainAccentColor,
  });
});

test('편집 UI처럼 아무것도 넘기지 않으면 도구 상태를 따른다', () => {
  useBuildingStore.getState().setSelectedTileObjectType('sand');
  const state = useBuildingStore.getState();
  const tile = addTileAt(`tool-${Date.now()}`, 16);
  expect(tile?.objectType).toBe('sand');
  expect(tile?.objectConfig).toEqual({
    terrainColor: state.currentTerrainColor,
    terrainAccentColor: state.currentTerrainAccentColor,
  });
});
