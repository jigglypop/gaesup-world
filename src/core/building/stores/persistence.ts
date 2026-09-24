import {
  createBlockFootprint,
  createTileFootprint,
  indexAabb,
  tileHalfSize,
  tilePositionToCell,
  wallTransformToEdge,
} from '../model';
import { BuildingSpatialIndex } from './spatialIndex';
import { tilePlacementCells } from '../model/placement';
import type {
  BuildingBlockConfig,
  BuildingSerializedState,
  MeshConfig,
  PlacedObject,
  TileCategory,
  TileConfig,
  TileGroupConfig,
  WallCategory,
  WallConfig,
  WallGroupConfig,
} from '../types';
import { createDefaultTileCategories, createDefaultWallCategories } from './defaultCategories';
import { TILE_CONSTANTS } from '../types/constants';

export type BuildingSerializableState = Pick<
  BuildingHydrationTarget,
  | 'meshes'
  | 'wallGroups'
  | 'tileGroups'
  | 'blocks'
  | 'objects'
  | 'showSnow'
  | 'showFog'
  | 'fogColor'
  | 'weatherEffect'
  | 'worldSurface'
  | 'wallCategories'
  | 'tileCategories'
>;

export type BuildingHydrationTarget = {
  meshes: Map<string, MeshConfig>;
  wallGroups: Map<string, WallGroupConfig>;
  tileGroups: Map<string, TileGroupConfig>;
  selectedWallGroupId?: string;
  selectedTileGroupId?: string;
  blocks: BuildingBlockConfig[];
  objects: PlacedObject[];
  spatialIndex: BuildingSpatialIndex;
  initialized: boolean;
  showSnow: boolean;
  showFog: boolean;
  fogColor: string;
  weatherEffect: BuildingSerializedState['weatherEffect'];
  worldSurface: BuildingSerializedState['worldSurface'];
  wallCategories: Map<string, WallCategory>;
  tileCategories: Map<string, TileCategory>;
};

export function serializeBuildingState(state: BuildingSerializableState): BuildingSerializedState {
  return {
    version: 1,
    meshes: Array.from(state.meshes.values(), cloneBuildingValue),
    wallGroups: Array.from(state.wallGroups.values(), cloneBuildingValue),
    tileGroups: Array.from(state.tileGroups.values(), cloneBuildingValue),
    blocks: state.blocks.map(cloneBuildingValue),
    objects: state.objects.map(cloneBuildingValue),
    showSnow: state.showSnow,
    showFog: state.showFog,
    fogColor: state.fogColor,
    weatherEffect: state.weatherEffect,
    worldSurface: state.worldSurface,
    wallCategories: Array.from(state.wallCategories.values(), cloneBuildingValue),
    tileCategories: Array.from(state.tileCategories.values(), cloneBuildingValue),
  };
}

function cloneBuildingValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function validateVector(value: unknown): void {
  if (!value || typeof value !== 'object' ||
    !('x' in value) || !Number.isFinite(value.x) ||
    !('y' in value) || !Number.isFinite(value.y) ||
    !('z' in value) || !Number.isFinite(value.z)) {
    throw new RangeError('Invalid building transform');
  }
}

function isCategoryList(value: unknown, groupKey: 'wallGroupIds' | 'tileGroupIds'): boolean {
  return Array.isArray(value) && value.every((category: unknown) => {
    if (!category || typeof category !== 'object') return false;
    const record = category as Record<string, unknown>;
    const groupIds = record[groupKey];
    return typeof record['id'] === 'string' && typeof record['name'] === 'string'
      && (record['description'] === undefined || typeof record['description'] === 'string')
      && Array.isArray(groupIds) && groupIds.every((id) => typeof id === 'string');
  });
}

function validateSize(value: unknown): void {
  if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)) {
    throw new RangeError('Invalid building size');
  }
}

export function hydrateBuildingState(
  state: BuildingHydrationTarget,
  data: Partial<BuildingSerializedState> | null | undefined,
): void {
  if (data === null || data === undefined) return;
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid building snapshot');
  }
  if (data.version !== undefined && data.version !== 1) {
    throw new Error('Unsupported building snapshot version');
  }
  const collections = ['meshes', 'wallGroups', 'tileGroups', 'blocks', 'objects', 'wallCategories', 'tileCategories'] as const;
  const settings = ['showSnow', 'showFog', 'fogColor', 'weatherEffect', 'worldSurface'] as const;
  if (![...collections, ...settings].some((key) => Object.prototype.hasOwnProperty.call(data, key))) {
    throw new Error('Empty building snapshot');
  }
  for (const key of collections) {
    if (Object.prototype.hasOwnProperty.call(data, key) && !Array.isArray(data[key])) {
      throw new Error(`Invalid building snapshot collection: ${key}`);
    }
  }
  if (
    (data.showSnow !== undefined && typeof data.showSnow !== 'boolean') ||
    (data.showFog !== undefined && typeof data.showFog !== 'boolean') ||
    (data.fogColor !== undefined && typeof data.fogColor !== 'string') ||
    (data.weatherEffect !== undefined && !['none', 'snow', 'rain', 'storm', 'wind'].includes(data.weatherEffect)) ||
    (data.worldSurface !== undefined && !['ground', 'water'].includes(data.worldSurface))
  ) throw new Error('Invalid building snapshot settings');
  if (
    (data.wallCategories !== undefined && !isCategoryList(data.wallCategories, 'wallGroupIds')) ||
    (data.tileCategories !== undefined && !isCategoryList(data.tileCategories, 'tileGroupIds'))
  ) throw new Error('Invalid building snapshot categories');

  for (const group of data.tileGroups ?? []) {
    for (const tile of group.tiles) {
      validateVector(tile.position);
      validateSize(tile.size);
    }
  }
  for (const group of data.wallGroups ?? []) {
    for (const wall of group.walls) {
      validateVector(wall.position);
      validateVector(wall.rotation);
    }
  }
  for (const block of data.blocks ?? []) {
    validateVector(block.position);
    if (block.size !== undefined) {
      if (block.size === null || typeof block.size !== 'object') throw new RangeError('Invalid building size');
      validateSize(block.size.x);
      validateSize(block.size.y);
      validateSize(block.size.z);
    }
  }
  for (const object of data.objects ?? []) validateVector(object.position);

  data = cloneBuildingValue(data);

  state.meshes.clear();
  state.wallGroups.clear();
  state.tileGroups.clear();
  // A fresh index keeps prepareHydrate side-effect free until the prepared state is applied.
  state.spatialIndex = new BuildingSpatialIndex();

  for (const mesh of data.meshes ?? []) {
    state.meshes.set(mesh.id, { ...mesh });
  }

  hydrateTileGroups(state, data.tileGroups ?? []);
  hydrateWallGroups(state, data.wallGroups ?? []);

  state.blocks = (data.blocks ?? []).map((block) => {
    const cell = block.cell ?? tilePositionToCell(block.position);
    state.spatialIndex.occupy(block.id, createBlockFootprint(cell, block.size));
    return { ...block, cell };
  });
  state.objects = (data.objects ?? []).map((object) => ({ ...object }));
  state.showSnow = data.showSnow ?? false;
  state.showFog = data.showFog ?? false;
  state.fogColor = data.fogColor ?? '#cfd8e3';
  state.weatherEffect = data.weatherEffect ?? (state.showSnow ? 'snow' : 'none');
  state.worldSurface = data.worldSurface ?? 'ground';
  // Snapshots without categories keep the current ones; an empty store falls back to the defaults.
  if (data.wallCategories) state.wallCategories = new Map(data.wallCategories.map((category) => [category.id, category]));
  else if (state.wallCategories.size === 0) state.wallCategories = createDefaultWallCategories();
  if (data.tileCategories) state.tileCategories = new Map(data.tileCategories.map((category) => [category.id, category]));
  else if (state.tileCategories.size === 0) state.tileCategories = createDefaultTileCategories();
  applySelectedGroupId(state, 'selectedTileGroupId', state.tileGroups);
  applySelectedGroupId(state, 'selectedWallGroupId', state.wallGroups);
  state.initialized = true;
}

export function applyBuildingHydration(state: BuildingHydrationTarget, prepared: BuildingHydrationTarget): void {
  Object.assign(state, {
    meshes: prepared.meshes, wallGroups: prepared.wallGroups, tileGroups: prepared.tileGroups,
    blocks: prepared.blocks, objects: prepared.objects,
    spatialIndex: prepared.spatialIndex,
    initialized: prepared.initialized, showSnow: prepared.showSnow, showFog: prepared.showFog,
    fogColor: prepared.fogColor, weatherEffect: prepared.weatherEffect, worldSurface: prepared.worldSurface,
    wallCategories: prepared.wallCategories, tileCategories: prepared.tileCategories,
  });
  applySelectedGroupId(state, 'selectedTileGroupId', state.tileGroups);
  applySelectedGroupId(state, 'selectedWallGroupId', state.wallGroups);
}

function applySelectedGroupId(
  state: BuildingHydrationTarget,
  key: 'selectedTileGroupId' | 'selectedWallGroupId',
  groups: Map<string, unknown>,
): void {
  const current = state[key];
  if (current && groups.has(current)) return;
  const first = groups.keys().next();
  if (first.done) {
    delete state[key];
    return;
  }
  state[key] = first.value;
}

function hydrateTileGroups(state: BuildingHydrationTarget, groups: TileGroupConfig[]): void {
  const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;
  for (const group of groups) {
    const tiles = group.tiles.map((tile) => {
      const cell = tile.cell ?? tilePositionToCell(tile.position);
      const tileWithCell: TileConfig = {
        ...tile,
        cell,
        footprint: tile.footprint ?? createTileFootprint(cell, tile.size || 1),
      };
      const halfSize = tileHalfSize(tileWithCell.size || 1);
      state.spatialIndex.tileMeta.set(tileWithCell.id, {
        x: tileWithCell.position.x,
        z: tileWithCell.position.z,
        y: tileWithCell.position.y,
        halfSize,
      });
      indexAabb(
        state.spatialIndex.tileIndex,
        state.spatialIndex.tileCells,
        tileWithCell.id,
        tileWithCell.position.x - halfSize,
        tileWithCell.position.x + halfSize,
        tileWithCell.position.z - halfSize,
        tileWithCell.position.z + halfSize,
        cellSize,
      );
      state.spatialIndex.occupy(tileWithCell.id, tilePlacementCells(tileWithCell));
      return tileWithCell;
    });
    state.tileGroups.set(group.id, { ...group, tiles });
  }
}

function hydrateWallGroups(state: BuildingHydrationTarget, groups: WallGroupConfig[]): void {
  for (const group of groups) {
    const walls = group.walls.map((wall) => {
      const wallWithEdge: WallConfig = {
        ...wall,
        edge: wall.edge ?? wallTransformToEdge(wall.position, wall.rotation.y),
      };
      const tol = 0.5;
      state.spatialIndex.wallMeta.set(wallWithEdge.id, {
        x: wallWithEdge.position.x,
        z: wallWithEdge.position.z,
        rotY: wallWithEdge.rotation.y,
      });
      indexAabb(
        state.spatialIndex.wallIndex,
        state.spatialIndex.wallCells,
        wallWithEdge.id,
        wallWithEdge.position.x - tol,
        wallWithEdge.position.x + tol,
        wallWithEdge.position.z - tol,
        wallWithEdge.position.z + tol,
        1,
      );
      return wallWithEdge;
    });
    state.wallGroups.set(group.id, { ...group, walls });
  }
}
