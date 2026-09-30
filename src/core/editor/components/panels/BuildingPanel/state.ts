import { useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { createScopedColorMeshConfig, isBuildingMaterialAsset, lookMeshId } from './helpers';
import type { AssetRecord } from '../../../../assets';
import { createScopedAssetMeshConfig, createScopedBuildingMeshId, useAssetStore } from '../../../../assets';
import { useBuildingStore, type BuildingStoreApi } from '../../../../building/stores/buildingStore';
import type { MeshConfig, TileConfig, TileGroupConfig, WallConfig, WallGroupConfig } from '../../../../building/types';

type BuildingState = ReturnType<BuildingStoreApi['getState']>;

/**
 * Subscribes a panel leaf to exactly `keys`, so hover moves and edits a section does not show never re-render it.
 * Actions are read with `getState()` at event time instead of being subscribed.
 */
export function useBuildingFields<K extends keyof BuildingState>(keys: readonly K[]): Pick<BuildingState, K> {
  return useBuildingStore(useShallow((state) => {
    const picked = {} as Pick<BuildingState, K>;
    for (const key of keys) picked[key] = state[key];
    return picked;
  }));
}

type WallTarget = { group: WallGroupConfig | undefined; wall: WallConfig | undefined };
type TileTarget = { group: TileGroupConfig | undefined; tile: TileConfig | undefined };

// A selected wall or tile edits its own group; otherwise the group chosen for the next placement.
export function findWallTarget(
  { wallGroups, selectedWallId, selectedWallGroupId }: Pick<BuildingState, 'wallGroups' | 'selectedWallId' | 'selectedWallGroupId'>,
): WallTarget {
  if (!selectedWallId) return { group: wallGroups.get(selectedWallGroupId ?? ''), wall: undefined };
  for (const group of wallGroups.values()) {
    const wall = group.walls.find((entry) => entry.id === selectedWallId);
    if (wall) return { group, wall };
  }
  return { group: undefined, wall: undefined };
}

export function findTileTarget(
  { tileGroups, selectedTileId, selectedTileGroupId }: Pick<BuildingState, 'tileGroups' | 'selectedTileId' | 'selectedTileGroupId'>,
): TileTarget {
  if (!selectedTileId) return { group: tileGroups.get(selectedTileGroupId ?? ''), tile: undefined };
  for (const group of tileGroups.values()) {
    const tile = group.tiles.find((entry) => entry.id === selectedTileId);
    if (tile) return { group, tile };
  }
  return { group: undefined, tile: undefined };
}

const WALL_TARGET_FIELDS = ['wallGroups', 'selectedWallId', 'selectedWallGroupId'] as const;
const TILE_TARGET_FIELDS = ['tileGroups', 'selectedTileId', 'selectedTileGroupId'] as const;

export function useWallTarget(): WallTarget {
  const fields = useBuildingFields(WALL_TARGET_FIELDS);
  return useMemo(() => findWallTarget(fields), [fields]);
}

export function useTileTarget(): TileTarget {
  const fields = useBuildingFields(TILE_TARGET_FIELDS);
  return useMemo(() => findTileTarget(fields), [fields]);
}

export function useBuildingAssets(): AssetRecord[] {
  const assetIds = useAssetStore((state) => state.ids);
  const assetRecords = useAssetStore((state) => state.records);
  return useMemo(
    () => assetIds
      .map((id) => assetRecords[id])
      .filter((asset): asset is AssetRecord => Boolean(asset))
      .filter(isBuildingMaterialAsset),
    [assetIds, assetRecords],
  );
}

/** The placement mesh for a look, added once; the same look picked again reuses it and changes nothing. */
function placementMesh(store: BuildingStoreApi, scope: string, look: MeshConfig): string {
  const id = lookMeshId(scope, look);
  const state = store.getState();
  if (!state.meshes.has(id)) state.addMesh({ ...look, id });
  return id;
}

function upsertScopedMesh(
  store: BuildingStoreApi,
  sourceMeshId: string | undefined,
  scopeId: string,
  surface: string,
  asset: AssetRecord,
): string {
  const { meshes, addMesh, updateMesh } = store.getState();
  const nextMeshId = createScopedBuildingMeshId(scopeId, surface, asset.id);
  const nextMesh = createScopedAssetMeshConfig(nextMeshId, asset, sourceMeshId ? meshes.get(sourceMeshId) : undefined);
  if (meshes.has(nextMeshId)) updateMesh(nextMeshId, nextMesh);
  else addMesh(nextMesh);
  return nextMeshId;
}

export function applyAssetToWall(store: BuildingStoreApi, asset: AssetRecord): void {
  const state = store.getState();
  const { group, wall } = findWallTarget(state);
  if (!group) return;
  if (state.selectedWallId) {
    const meshId = upsertScopedMesh(store, wall?.materialId ?? group.frontMeshId, state.selectedWallId, 'wall', asset);
    state.updateWall(group.id, state.selectedWallId, { materialId: meshId });
    return;
  }
  state.setCurrentWallMaterialId(
    placementMesh(store, 'placement-wall', createScopedAssetMeshConfig('', asset, group.frontMeshId ? state.meshes.get(group.frontMeshId) : undefined)),
  );
}

export function applyAssetToTile(store: BuildingStoreApi, asset: AssetRecord): void {
  const state = store.getState();
  const { group, tile } = findTileTarget(state);
  if (!group) return;
  if (state.selectedTileId) {
    const meshId = upsertScopedMesh(store, tile?.materialId ?? group.floorMeshId, state.selectedTileId, 'tile', asset);
    state.updateTile(group.id, state.selectedTileId, { materialId: meshId });
    return;
  }
  state.setCurrentTileMaterialId(
    placementMesh(store, 'placement-tile', createScopedAssetMeshConfig('', asset, state.meshes.get(group.floorMeshId))),
  );
}

export function applyColorToTile(store: BuildingStoreApi, color: string): void {
  const state = store.getState();
  const { group, tile } = findTileTarget(state);
  if (!group) return;
  const { meshes, selectedTileId } = state;
  if (selectedTileId) {
    const meshId = createScopedBuildingMeshId(selectedTileId, 'tile-color', color);
    const mesh = createScopedColorMeshConfig(meshId, color, meshes.get(tile?.materialId ?? group.floorMeshId));
    if (meshes.has(meshId)) state.updateMesh(meshId, mesh);
    else state.addMesh(mesh);
    state.updateTile(group.id, selectedTileId, { materialId: meshId });
    return;
  }
  const look = createScopedColorMeshConfig('', color, meshes.get(state.currentTileMaterialId ?? group.floorMeshId));
  state.setCurrentTileMaterialId(placementMesh(store, 'placement-tile-color', look));
}

export function applyTerrainColors(store: BuildingStoreApi, color: string, accentColor: string): void {
  const state = store.getState();
  state.setTerrainColors(color, accentColor);
  const { group, tile } = findTileTarget(state);
  if (!group || !tile || !tile.objectType || tile.objectType === 'none' || tile.objectType === 'water') return;
  state.updateTile(group.id, tile.id, {
    objectConfig: { ...(tile.objectConfig ?? {}), terrainColor: color, terrainAccentColor: accentColor },
  });
}
