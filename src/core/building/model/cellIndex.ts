import { TILE_CONSTANTS } from '../types/constants';

export type XZBounds = { minX: number; maxX: number; minZ: number; maxZ: number };
/** The items whose bounds overlap the grid cell holding a point; callers still test the point against each one. */
export type CellQuery<T> = (x: number, z: number) => readonly T[];

const NONE: readonly never[] = [];
// Unique while |cz| stays under 2^20 cells.
const cellKey = (cx: number, cz: number) => cx * 0x200000 + cz;

/** Buckets items by the grid cells their XZ bounds overlap, so a point lookup scans a few items instead of all. */
export function createCellIndex<T>(
  items: readonly T[],
  boundsOf: (item: T) => XZBounds,
  cellSize: number = TILE_CONSTANTS.GRID_CELL_SIZE,
): CellQuery<T> {
  const cells = new Map<number, T[]>();
  for (const item of items) {
    const { minX, maxX, minZ, maxZ } = boundsOf(item);
    for (let cx = Math.floor(minX / cellSize); cx <= Math.floor(maxX / cellSize); cx++) {
      for (let cz = Math.floor(minZ / cellSize); cz <= Math.floor(maxZ / cellSize); cz++) {
        const key = cellKey(cx, cz);
        const list = cells.get(key);
        if (list) list.push(item);
        else cells.set(key, [item]);
      }
    }
  }
  return (x, z) => cells.get(cellKey(Math.floor(x / cellSize), Math.floor(z / cellSize))) ?? NONE;
}
