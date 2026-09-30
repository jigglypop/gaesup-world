import type { BuildingStore } from './buildingStoreTypes';
import type { BUILDING_TILE_PRESETS, BUILDING_WALL_PRESETS } from '../types';

type TilePreset = (typeof BUILDING_TILE_PRESETS)[number];
type WallPreset = (typeof BUILDING_WALL_PRESETS)[number];

export function ensureTileCategory(
  state: BuildingStore,
  id: string,
  name: string,
  description: string,
): void {
  if (!state.tileCategories.has(id)) {
    state.tileCategories.set(id, { id, name, description, tileGroupIds: [] });
  }
}

export function ensureTileGroupInCategory(
  state: BuildingStore,
  categoryId: string,
  groupId: string,
): void {
  const category = state.tileCategories.get(categoryId);
  if (!category || category.tileGroupIds.includes(groupId)) return;
  state.tileCategories.set(categoryId, {
    ...category,
    tileGroupIds: [...category.tileGroupIds, groupId],
  });
}

function ensureWallCategory(
  state: BuildingStore,
  id: string,
  name: string,
  description: string,
): void {
  if (!state.wallCategories.has(id)) {
    state.wallCategories.set(id, { id, name, description, wallGroupIds: [] });
  }
}

function ensureWallGroupInCategory(
  state: BuildingStore,
  categoryId: string,
  groupId: string,
): void {
  const category = state.wallCategories.get(categoryId);
  if (!category || category.wallGroupIds.includes(groupId)) return;
  state.wallCategories.set(categoryId, {
    ...category,
    wallGroupIds: [...category.wallGroupIds, groupId],
  });
}

/** Registers a tile preset's category, mesh and group and returns the group id; `keepMesh` leaves an existing mesh alone. */
export function installTilePreset(state: BuildingStore, preset: TilePreset, keepMesh = false): string {
  const meshId = `tile-${preset.id}`;
  const groupId = `${preset.id}-floor`;
  ensureTileCategory(state, preset.categoryId, preset.categoryName, `${preset.categoryName} 바닥 프리셋`);
  ensureTileGroupInCategory(state, preset.categoryId, groupId);
  if (!keepMesh || !state.meshes.has(meshId)) {
    state.meshes.set(meshId, {
      id: meshId,
      color: preset.color,
      material: preset.material ?? 'STANDARD',
      roughness: preset.roughness ?? 0.65,
      metalness: preset.metalness ?? 0.02,
      ...(preset.opacity !== undefined ? { opacity: preset.opacity } : {}),
      ...(preset.transparent !== undefined ? { transparent: preset.transparent } : {}),
      ...(preset.mapTextureUrl ? { mapTextureUrl: preset.mapTextureUrl, textureUrl: preset.mapTextureUrl } : {}),
    });
  }
  if (!state.tileGroups.has(groupId)) {
    state.tileGroups.set(groupId, { id: groupId, name: preset.labelKo, floorMeshId: meshId, tiles: [] });
  }
  return groupId;
}

/** Registers a wall preset's category, meshes and group and returns the group id. */
export function installWallPreset(state: BuildingStore, preset: WallPreset): string {
  const exteriorMeshId = `wall-${preset.id}-exterior`;
  const interiorMeshId = `wall-${preset.id}-interior`;
  const sideMeshId = `wall-${preset.id}-side`;
  const groupId = `${preset.id}-walls`;
  ensureWallCategory(state, preset.categoryId, preset.categoryName, `${preset.categoryName} 벽 프리셋`);
  ensureWallGroupInCategory(state, preset.categoryId, groupId);
  const surface = { material: 'STANDARD' as const, metalness: preset.metalness ?? 0.02 };
  state.meshes.set(exteriorMeshId, { id: exteriorMeshId, color: preset.exteriorColor, ...surface, roughness: preset.roughness ?? 0.78 });
  state.meshes.set(interiorMeshId, { id: interiorMeshId, color: preset.interiorColor, ...surface, roughness: preset.roughness ?? 0.78 });
  state.meshes.set(sideMeshId, { id: sideMeshId, color: preset.sideColor, ...surface, roughness: preset.roughness ?? 0.82 });
  if (!state.wallGroups.has(groupId)) {
    state.wallGroups.set(groupId, {
      id: groupId,
      name: preset.labelKo,
      frontMeshId: exteriorMeshId,
      backMeshId: interiorMeshId,
      sideMeshId,
      defaultWallKind: preset.defaultKind,
      walls: [],
    });
  }
  return groupId;
}
