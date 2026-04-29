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
  'meshes' | 'wallGroups' | 'tileGroups' | 'blocks' | 'objects'
>;

export type BuildingHydrationTarget = {
  meshes: Map<string, MeshConfig>;
  wallGroups: Map<string, WallGroupConfig>;
  tileGroups: Map<string, TileGroupConfig>;
  blocks: BuildingBlockConfig[];
  objects: PlacedObject[];
  tileIndex: Map<number, Set<string>>;
  tileCells: Map<string, number[]>;
  tileMeta: Map<string, TileMeta>;
  wallIndex: Map<number, Set<string>>;
  wallCells: Map<string, number[]>;
  wallMeta: Map<string, WallMeta>;
  initialized: boolean;
};

export function serializeBuildingState(state: BuildingSerializableState): BuildingSerializedState {
  return {
    version: 1,
    meshes: Array.from(state.meshes.values(), cloneBuildingValue),
    wallGroups: Array.from(state.wallGroups.values(), cloneBuildingValue),
    tileGroups: Array.from(state.tileGroups.values(), cloneBuildingValue),
    blocks: state.blocks.map(cloneBuildingValue),
    objects: state.objects.map(cloneBuildingValue),
  };
}

function cloneBuildingValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

export function hydrateBuildingState(
  state: BuildingHydrationTarget,
  data: Partial<BuildingSerializedState> | null | undefined,
): void {
  if (!data) return;

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
  state.initialized = true;
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
