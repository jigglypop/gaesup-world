import { SquareGridAdapter } from '../../grid';
import type { CellCoord, EdgeCoord, EdgeSide, Vec3 } from '../../grid';
import type { GridAdapter } from '../../grid';
import { createNoOverlapRule, createPlacementEngine } from '../../placement';
import type { PlacementEngine, PlacementEntry, PlacementRule } from '../../placement';
import type {
  BuildingBlockConfig,
  TileConfig,
  TileGroupConfig,
  WallConfig,
  WallGroupConfig,
} from '../types';
import { TILE_CONSTANTS } from '../types/constants';

export type TileMeta = { x: number; z: number; y: number; halfSize: number };
export type WallMeta = { x: number; z: number; rotY: number };
export type BuildingPlacementCoord =
  | { kind: 'cell'; cell: CellCoord }
  | { kind: 'edge'; edge: EdgeCoord };
export interface BuildingPlacementEngineOptions {
  includeNoOverlapRule?: boolean;
  rules?: Array<PlacementRule<BuildingPlacementCoord>>;
  blocks?: Iterable<BuildingBlockConfig>;
}

export const buildingGridAdapter = new SquareGridAdapter({
  id: 'building-square',
  spec: {
    cellSize: TILE_CONSTANTS.GRID_CELL_SIZE,
    heightStep: TILE_CONSTANTS.HEIGHT_STEP,
    origin: 'center',
  },
});

export const zigZag = (n: number): number => (n >= 0 ? n * 2 : (-n * 2) - 1);

export const pair = (a: number, b: number): number => {
  const A = zigZag(a);
  const B = zigZag(b);
  const sum = A + B;
  return (sum * (sum + 1)) / 2 + B;
};

export const snapBuildingPosition = <TPosition extends Vec3>(position: TPosition): TPosition => ({
  ...position,
  x: Math.round(position.x / TILE_CONSTANTS.SNAP_GRID_SIZE) * TILE_CONSTANTS.SNAP_GRID_SIZE,
  z: Math.round(position.z / TILE_CONSTANTS.SNAP_GRID_SIZE) * TILE_CONSTANTS.SNAP_GRID_SIZE,
});

export const worldToBuildingCell = (position: Vec3): CellCoord => buildingGridAdapter.fromWorld(position);

export const buildingCellToWorld = (coord: CellCoord): Vec3 => buildingGridAdapter.toWorld(coord);

export const normalizeQuarterTurnRotation = (rotation: number): number => {
  const turn = Math.PI / 2;
  const quarterTurns = Math.round(rotation / turn);
  const normalized = ((quarterTurns % 4) + 4) % 4;
  return normalized * turn;
};

export const edgeSideToWallRotation = (side: EdgeSide): number => {
  switch (side) {
    case 'north':
    case 'south':
      return Math.PI / 2;
    case 'east':
    case 'west':
      return 0;
  }
};

export const edgeToWallTransform = (
  edge: EdgeCoord,
): { position: Vec3; rotationY: number } => {
  const center = buildingGridAdapter.edgeToWorld(edge);
  const rotationY = edgeSideToWallRotation(edge.side);
  const half = TILE_CONSTANTS.WALL_SIZES.WIDTH / 2;
  const direction = {
    x: Math.sin(rotationY),
    z: Math.cos(rotationY),
  };

  return {
    position: {
      x: cleanNumber(center.x - direction.x * half),
      y: center.y,
      z: cleanNumber(center.z - direction.z * half),
    },
    rotationY,
  };
};

export const wallTransformToEdge = (
  position: Vec3,
  rotationY: number,
): EdgeCoord => {
  const normalized = normalizeQuarterTurnRotation(rotationY);
  const half = TILE_CONSTANTS.WALL_SIZES.WIDTH / 2;
  const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;
  const center = {
    x: position.x + Math.sin(normalized) * half,
    y: position.y,
    z: position.z + Math.cos(normalized) * half,
  };

  if (normalized === 0 || normalized === Math.PI) {
    const cellX = Math.trunc(center.x / cellSize);
    const edgeOffset = center.x - cellX * cellSize;
    return {
      x: cleanNumber(cellX),
      z: cleanNumber(Math.round(center.z / cellSize)),
      level: cleanNumber(Math.round(center.y / TILE_CONSTANTS.HEIGHT_STEP)),
      side: edgeOffset >= 0 ? 'east' : 'west',
    };
  }

  return {
    x: cleanNumber(Math.round(center.x / cellSize)),
    z: cleanNumber(Math.trunc(center.z / cellSize)),
    level: cleanNumber(Math.round(center.y / TILE_CONSTANTS.HEIGHT_STEP)),
    side: center.z - Math.trunc(center.z / cellSize) * cellSize >= 0 ? 'south' : 'north',
  };
};

export const edgeKey = (edge: EdgeCoord): string => buildingGridAdapter.edgeKey(edge);

const cleanNumber = (value: number): number => Object.is(value, -0) || Math.abs(value) < 1e-10
  ? 0
  : Number(value.toFixed(10));

export const tilePositionToCell = (position: Vec3): CellCoord => worldToBuildingCell(position);

export const cellToTilePosition = (cell: CellCoord): Vec3 => buildingCellToWorld(cell);

export const createTileFootprint = (
  cell: CellCoord,
  size = 1,
): CellCoord[] => {
  const normalizedSize = Math.max(1, Math.round(size));
  const start = -Math.floor(normalizedSize / 2);
  const coords: CellCoord[] = [];

  for (let dx = 0; dx < normalizedSize; dx++) {
    for (let dz = 0; dz < normalizedSize; dz++) {
      coords.push({
        x: cell.x + start + dx,
        z: cell.z + start + dz,
        level: cell.level,
      });
    }
  }

  return coords;
};

export const tileFootprintKeys = (footprint: CellCoord[]): string[] =>
  footprint.map((cell) => buildingGridAdapter.key(cell));

export const createBlockFootprint = (
  cell: CellCoord,
  size: BuildingBlockConfig['size'] = {},
): CellCoord[] => {
  const width = Math.max(1, Math.round(size.x ?? 1));
  const height = Math.max(1, Math.round(size.y ?? 1));
  const depth = Math.max(1, Math.round(size.z ?? 1));
  const coords: CellCoord[] = [];

  for (let dx = 0; dx < width; dx++) {
    for (let dy = 0; dy < height; dy++) {
      for (let dz = 0; dz < depth; dz++) {
        coords.push({
          x: cell.x + dx,
          z: cell.z + dz,
          level: cell.level + dy,
        });
      }
    }
  }

  return coords;
};

export const buildingPlacementAdapter: GridAdapter<BuildingPlacementCoord> = {
  id: 'building-placement',

  toWorld(coord) {
    return coord.kind === 'cell'
      ? buildingGridAdapter.toWorld(coord.cell)
      : buildingGridAdapter.edgeToWorld(coord.edge);
  },

  fromWorld(position) {
    return {
      kind: 'cell',
      cell: buildingGridAdapter.fromWorld(position),
    };
  },

  getNeighbors(coord) {
    if (coord.kind === 'edge') {
      return [coord];
    }
    return buildingGridAdapter
      .getNeighbors(coord.cell)
      .map((cell) => ({ kind: 'cell', cell }));
  },

  equals(a, b) {
    return this.key(a) === this.key(b);
  },

  key(coord) {
    return coord.kind === 'cell'
      ? `cell:${buildingGridAdapter.key(coord.cell)}`
      : `edge:${buildingGridAdapter.edgeKey(coord.edge)}`;
  },
};

export const tileToPlacementEntry = (
  tile: TileConfig,
): PlacementEntry<BuildingPlacementCoord> => {
  const cell = tile.cell ?? tilePositionToCell(tile.position);
  const footprint = tile.footprint ?? createTileFootprint(cell, tile.size || 1);
  const entry: PlacementEntry<BuildingPlacementCoord> = {
    id: tile.id,
    subject: {
      id: tile.id,
      type: 'tile',
      tags: [
        'building',
        'tile',
        `shape:${tile.shape ?? 'box'}`,
        ...(tile.objectType && tile.objectType !== 'none' ? [`terrain:${tile.objectType}`] : []),
      ],
    },
    coord: { kind: 'cell', cell },
    footprint: {
      kind: 'cell',
      coords: footprint.map((footprintCell) => ({ kind: 'cell', cell: footprintCell })),
    },
  };
  if (tile.rotation !== undefined) {
    entry.rotation = tile.rotation;
  }
  return entry;
};

export const wallToPlacementEntry = (
  wall: WallConfig,
): PlacementEntry<BuildingPlacementCoord> => {
  const edge = wall.edge ?? wallTransformToEdge(wall.position, wall.rotation.y);
  return {
    id: wall.id,
    subject: {
      id: wall.id,
      type: 'wall',
      tags: ['building', 'wall', `side:${edge.side}`],
    },
    coord: { kind: 'edge', edge },
    footprint: {
      kind: 'edge',
      coords: [{ kind: 'edge', edge }],
    },
    rotation: wall.rotation.y,
  };
};

export const blockToPlacementEntry = (
  block: BuildingBlockConfig,
): PlacementEntry<BuildingPlacementCoord> => {
  const cell = block.cell ?? tilePositionToCell(block.position);
  const footprint = createBlockFootprint(cell, block.size);
  return {
    id: block.id,
    subject: {
      id: block.id,
      type: 'block',
      tags: [
        'building',
        'block',
        ...(block.materialId ? [`material:${block.materialId}`] : []),
        ...(block.tags ?? []),
      ],
    },
    coord: { kind: 'cell', cell },
    footprint: {
      kind: 'volume',
      coords: footprint.map((footprintCell) => ({ kind: 'cell', cell: footprintCell })),
    },
  };
};

export const tileGroupToPlacementEntries = (
  group: TileGroupConfig,
): Array<PlacementEntry<BuildingPlacementCoord>> =>
  group.tiles.map(tileToPlacementEntry);

export const wallGroupToPlacementEntries = (
  group: WallGroupConfig,
): Array<PlacementEntry<BuildingPlacementCoord>> =>
  group.walls.map(wallToPlacementEntry);

export const buildingGroupsToPlacementEntries = (
  tileGroups: Iterable<TileGroupConfig>,
  wallGroups: Iterable<WallGroupConfig>,
  blocks: Iterable<BuildingBlockConfig> = [],
): Array<PlacementEntry<BuildingPlacementCoord>> => [
  ...Array.from(tileGroups).flatMap(tileGroupToPlacementEntries),
  ...Array.from(wallGroups).flatMap(wallGroupToPlacementEntries),
  ...Array.from(blocks).map(blockToPlacementEntry),
];

export const createBuildingPlacementEngine = (
  tileGroups: Iterable<TileGroupConfig> = [],
  wallGroups: Iterable<WallGroupConfig> = [],
  options: BuildingPlacementEngineOptions = {},
): PlacementEngine<BuildingPlacementCoord> => {
  const rules = [
    ...(options.includeNoOverlapRule === false ? [] : [createNoOverlapRule<BuildingPlacementCoord>()]),
    ...(options.rules ?? []),
  ];
  const engine = createPlacementEngine<BuildingPlacementCoord>({
    adapter: buildingPlacementAdapter,
    rules: [],
  });

  for (const entry of buildingGroupsToPlacementEntries(tileGroups, wallGroups, options.blocks ?? [])) {
    const request = {
      subject: entry.subject,
      coord: entry.coord,
      footprint: entry.footprint,
    };
    engine.place(entry.rotation === undefined ? request : { ...request, rotation: entry.rotation });
  }

  for (const rule of rules) {
    engine.use(rule);
  }

  return engine;
};

export const unindexId = (
  cells: Map<number, Set<string>>,
  cellsById: Map<string, number[]>,
  id: string,
): void => {
  const keys = cellsById.get(id);
  if (!keys) return;
  for (const key of keys) {
    const set = cells.get(key);
    if (!set) continue;
    set.delete(id);
    if (set.size === 0) cells.delete(key);
  }
  cellsById.delete(id);
};

export const indexAabb = (
  cells: Map<number, Set<string>>,
  cellsById: Map<string, number[]>,
  id: string,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  cellSize: number,
): void => {
  const minCellX = Math.floor(minX / cellSize);
  const maxCellX = Math.floor(maxX / cellSize);
  const minCellZ = Math.floor(minZ / cellSize);
  const maxCellZ = Math.floor(maxZ / cellSize);

  const keys: number[] = [];
  for (let cx = minCellX; cx <= maxCellX; cx++) {
    for (let cz = minCellZ; cz <= maxCellZ; cz++) {
      const key = pair(cx, cz);
      let set = cells.get(key);
      if (!set) {
        set = new Set<string>();
        cells.set(key, set);
      }
      set.add(id);
      keys.push(key);
    }
  }
  cellsById.set(id, keys);
};

export const queryAabbIds = (
  cells: Map<number, Set<string>>,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  cellSize: number,
): Set<string> => {
  const minCellX = Math.floor(minX / cellSize);
  const maxCellX = Math.floor(maxX / cellSize);
  const minCellZ = Math.floor(minZ / cellSize);
  const maxCellZ = Math.floor(maxZ / cellSize);
  const result = new Set<string>();

  for (let cx = minCellX; cx <= maxCellX; cx++) {
    for (let cz = minCellZ; cz <= maxCellZ; cz++) {
      const set = cells.get(pair(cx, cz));
      if (!set) continue;
      for (const id of set) {
        result.add(id);
      }
    }
  }

  return result;
};

export const tileHalfSize = (multiplier: number): number =>
  (TILE_CONSTANTS.GRID_CELL_SIZE * multiplier) / 2;

export const tileOverlaps = (
  a: { x: number; z: number; halfSize: number },
  b: { x: number; z: number; halfSize: number },
): boolean =>
  Math.abs(a.x - b.x) < (a.halfSize + b.halfSize - 0.1) &&
  Math.abs(a.z - b.z) < (a.halfSize + b.halfSize - 0.1);

export const hasTileCollision = (
  tileIndex: Map<number, Set<string>>,
  tileMeta: Map<string, TileMeta>,
  position: Vec3,
  multiplier: number,
): boolean => {
  const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;
  const halfSize = tileHalfSize(multiplier);
  const yTolerance = TILE_CONSTANTS.HEIGHT_STEP * 0.5;
  const ids = queryAabbIds(
    tileIndex,
    position.x - halfSize,
    position.x + halfSize,
    position.z - halfSize,
    position.z + halfSize,
    cellSize,
  );

  for (const id of ids) {
    const meta = tileMeta.get(id);
    if (!meta) continue;
    if (!tileOverlaps({ x: position.x, z: position.z, halfSize }, meta)) continue;
    if (Math.abs((meta.y ?? 0) - position.y) < yTolerance) return true;
  }

  return false;
};

export const getTileSupportHeight = (
  tileIndex: Map<number, Set<string>>,
  tileMeta: Map<string, TileMeta>,
  position: Vec3,
  multiplier: number,
): number => {
  const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;
  const halfSize = tileHalfSize(multiplier);
  const ids = queryAabbIds(
    tileIndex,
    position.x - halfSize,
    position.x + halfSize,
    position.z - halfSize,
    position.z + halfSize,
    cellSize,
  );

  let support = 0;
  for (const id of ids) {
    const meta = tileMeta.get(id);
    if (!meta) continue;
    if (!tileOverlaps({ x: position.x, z: position.z, halfSize }, meta)) continue;
    const top = (meta.y ?? 0) + TILE_CONSTANTS.HEIGHT_STEP;
    if (top > support) support = top;
  }
  return support;
};

export const hasWallCollision = (
  wallIndex: Map<number, Set<string>>,
  wallMeta: Map<string, WallMeta>,
  position: Vec3,
  rotation: number,
): boolean => {
  const tolerance = 0.5;
  const ids = queryAabbIds(
    wallIndex,
    position.x - tolerance,
    position.x + tolerance,
    position.z - tolerance,
    position.z + tolerance,
    1,
  );

  for (const id of ids) {
    const meta = wallMeta.get(id);
    if (!meta) continue;
    if (
      Math.abs(meta.x - position.x) < tolerance &&
      Math.abs(meta.z - position.z) < tolerance &&
      Math.abs(meta.rotY - rotation) < 0.1
    ) {
      return true;
    }
  }

  return false;
};
