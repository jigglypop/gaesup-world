import type { TileConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';

export type WaterPatch = {
  key: string;
  center: [number, number, number];
  width: number;
  depth: number;
  shore: {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  };
};

function waterPatchCellKey(x: number, z: number): string {
  return `${x}:${z}`;
}

function buildWaterPatchShore(
  cells: Set<string>,
  startX: number,
  startZ: number,
  widthCells: number,
  depthCells: number,
): WaterPatch['shore'] {
  let north = false;
  let south = false;
  let east = false;
  let west = false;
  for (let x = 0; x < widthCells; x += 1) {
    const cellX = startX + x;
    north ||= !cells.has(waterPatchCellKey(cellX, startZ - 1));
    south ||= !cells.has(waterPatchCellKey(cellX, startZ + depthCells));
  }
  for (let z = 0; z < depthCells; z += 1) {
    const cellZ = startZ + z;
    west ||= !cells.has(waterPatchCellKey(startX - 1, cellZ));
    east ||= !cells.has(waterPatchCellKey(startX + widthCells, cellZ));
  }
  return { north, south, east, west };
}

export function buildWaterPatches(waterTiles: Pick<TileConfig, 'position' | 'size'>[]): WaterPatch[] {
  if (waterTiles.length === 0) return [];
  const unitSize = TILE_CONSTANTS.GRID_CELL_SIZE / 2;
  const cellsByLevel = new Map<number, Set<string>>();
  for (const tile of waterTiles) {
    const size = Math.max(1, Math.round(tile.size || 1));
    const tileSize = size * TILE_CONSTANTS.GRID_CELL_SIZE;
    const half = tileSize / 2;
    const minX = Math.round((tile.position.x - half) / unitSize);
    const maxX = Math.round((tile.position.x + half) / unitSize);
    const minZ = Math.round((tile.position.z - half) / unitSize);
    const maxZ = Math.round((tile.position.z + half) / unitSize);
    const level = Math.round(tile.position.y * 1000);
    let cells = cellsByLevel.get(level);
    if (!cells) {
      cells = new Set<string>();
      cellsByLevel.set(level, cells);
    }
    for (let z = minZ; z < maxZ; z += 1) {
      for (let x = minX; x < maxX; x += 1) {
        cells.add(waterPatchCellKey(x, z));
      }
    }
  }
  const patches: WaterPatch[] = [];
  for (const [level, cells] of cellsByLevel) {
    const remaining = new Set(cells);
    while (remaining.size > 0) {
      let startX = 0;
      let startZ = 0;
      let initialized = false;
      for (const cell of remaining) {
        const [x, z] = cell.split(':').map(Number) as [number, number];
        if (!initialized || z < startZ || (z === startZ && x < startX)) {
          startX = x;
          startZ = z;
          initialized = true;
        }
      }
      let widthCells = 1;
      while (remaining.has(waterPatchCellKey(startX + widthCells, startZ))) {
        widthCells += 1;
      }
      let depthCells = 1;
      let canGrow = true;
      while (canGrow) {
        const nextZ = startZ + depthCells;
        for (let x = 0; x < widthCells; x += 1) {
          if (!remaining.has(waterPatchCellKey(startX + x, nextZ))) {
            canGrow = false;
            break;
          }
        }
        if (canGrow) depthCells += 1;
      }
      for (let z = 0; z < depthCells; z += 1) {
        for (let x = 0; x < widthCells; x += 1) {
          remaining.delete(waterPatchCellKey(startX + x, startZ + z));
        }
      }
      const shore = buildWaterPatchShore(cells, startX, startZ, widthCells, depthCells);
      const width = widthCells * unitSize;
      const depth = depthCells * unitSize;
      const centerX = (startX + widthCells / 2) * unitSize;
      const centerZ = (startZ + depthCells / 2) * unitSize;
      const centerY = level / 1000;
      patches.push({
        key: `${level}:${startX}:${startZ}:${widthCells}:${depthCells}`,
        center: [centerX, centerY, centerZ],
        width,
        depth,
        shore,
      });
    }
  }
  return patches;
}
