import {
  createTileFootprint,
  indexAabb,
  tileHalfSize,
  tilePositionToCell,
  wallTransformToEdge,
} from '../model';
import type { TileMeta, WallMeta } from '../model';
import type {
  BuildingBlockConfig,
  BuildingSerializedState,
  MeshConfig,
  PlacedObject,
  TileConfig,
  TileGroupConfig,
  WallConfig,
  WallGroupConfig,
} from '../types';
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
>;

export type BuildingHydrationTarget = {
  meshes: Map<string, MeshConfig>;
  wallGroups: Map<string, WallGroupConfig>;
  tileGroups: Map<string, TileGroupConfig>;
  selectedWallGroupId?: string;
  selectedTileGroupId?: string;
  blocks: BuildingBlockConfig[];
  objects: PlacedObject[];
  tileIndex: Map<number, Set<string>>;
  tileCells: Map<string, number[]>;
  tileMeta: Map<string, TileMeta>;
  wallIndex: Map<number, Set<string>>;
  wallCells: Map<string, number[]>;
  wallMeta: Map<string, WallMeta>;
  initialized: boolean;
  showSnow: boolean;
  showFog: boolean;
  fogColor: string;
  weatherEffect: BuildingSerializedState['weatherEffect'];
  worldSurface: BuildingSerializedState['worldSurface'];
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
  const collections = ['meshes', 'wallGroups', 'tileGroups', 'blocks', 'objects'] as const;
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
  state.tileIndex.clear();
  state.tileCells.clear();
  state.tileMeta.clear();
  state.wallIndex.clear();
  state.wallCells.clear();
  state.wallMeta.clear();

  for (const mesh of data.meshes ?? []) {
    state.meshes.set(mesh.id, { ...mesh });
  }

  hydrateTileGroups(state, data.tileGroups ?? []);
  hydrateWallGroups(state, data.wallGroups ?? []);

  state.blocks = (data.blocks ?? []).map((block) => ({
    ...block,
    cell: block.cell ?? tilePositionToCell(block.position),
  }));
  state.objects = (data.objects ?? []).map((object) => ({ ...object }));
  state.showSnow = data.showSnow ?? false;
  state.showFog = data.showFog ?? false;
  state.fogColor = data.fogColor ?? '#cfd8e3';
  state.weatherEffect = data.weatherEffect ?? (state.showSnow ? 'snow' : 'none');
  state.worldSurface = data.worldSurface ?? 'ground';
  applySelectedGroupId(state, 'selectedTileGroupId', state.tileGroups);
  applySelectedGroupId(state, 'selectedWallGroupId', state.wallGroups);
  state.initialized = true;
}

export function applyBuildingHydration(state: BuildingHydrationTarget, prepared: BuildingHydrationTarget): void {
  Object.assign(state, {
    meshes: prepared.meshes, wallGroups: prepared.wallGroups, tileGroups: prepared.tileGroups,
    blocks: prepared.blocks, objects: prepared.objects,
    tileIndex: prepared.tileIndex, tileCells: prepared.tileCells, tileMeta: prepared.tileMeta,
    wallIndex: prepared.wallIndex, wallCells: prepared.wallCells, wallMeta: prepared.wallMeta,
    initialized: prepared.initialized, showSnow: prepared.showSnow, showFog: prepared.showFog,
    fogColor: prepared.fogColor, weatherEffect: prepared.weatherEffect, worldSurface: prepared.worldSurface,
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
      state.tileMeta.set(tileWithCell.id, {
        x: tileWithCell.position.x,
        z: tileWithCell.position.z,
        y: tileWithCell.position.y,
        halfSize,
      });
      indexAabb(
        state.tileIndex,
        state.tileCells,
        tileWithCell.id,
        tileWithCell.position.x - halfSize,
        tileWithCell.position.x + halfSize,
        tileWithCell.position.z - halfSize,
        tileWithCell.position.z + halfSize,
        cellSize,
      );
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
      state.wallMeta.set(wallWithEdge.id, {
        x: wallWithEdge.position.x,
        z: wallWithEdge.position.z,
        rotY: wallWithEdge.rotation.y,
      });
      indexAabb(
        state.wallIndex,
        state.wallCells,
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
