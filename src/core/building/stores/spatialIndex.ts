import type { CellCoord } from '../../grid';
import { pair, unindexId, type TileMeta, type WallMeta } from '../model';
import { tileWorldSize, wallBox } from '../model/footprint';
import { aabbCellKeys, insertCellKeys, tilePlacementCells, WALL_INDEX_TOLERANCE } from '../model/placement';
import type { TileConfig, WallConfig } from '../types';
import { TILE_CONSTANTS } from '../types/constants';

/**
 * Mutable placement indexes. Immer never drafts class instances, so keeping these maps here instead of in
 * plain store state turns each edit from copying every index entry into an O(changed tiles) update.
 * Hydration fills a fresh instance and swaps it in, keeping prepare/apply rollback intact.
 */
export class BuildingSpatialIndex {
  readonly tileIndex = new Map<number, Set<string>>();
  readonly tileCells = new Map<string, number[]>();
  readonly tileMeta = new Map<string, TileMeta>();
  readonly wallIndex = new Map<number, Set<string>>();
  readonly wallCells = new Map<string, number[]>();
  readonly wallMeta = new Map<string, WallMeta>();
  // Placement cells of tiles and blocks bucketed by (x, z) column: what the engine's no-overlap rule tests.
  readonly placementColumns = new Map<number, Set<string>>();
  readonly placementCells = new Map<string, readonly CellCoord[]>();

  /**
   * Swaps the entries of `previous` tiles for `next` ones. Every entry is worked out before any is removed, so a
   * tile the index rejects throws with the index untouched, as the store's own state is when its update throws.
   * Cells are copied so an Immer draft never lands here.
   */
  replaceTiles(previous: readonly { id: string }[], next: readonly TileConfig[]): void {
    const entries = next.map((tile) => {
      const { x, y, z } = tile.position;
      const halfSize = tileWorldSize(tile) / 2;
      return {
        id: tile.id,
        meta: { x, z, y, halfSize },
        keys: aabbCellKeys(x - halfSize, x + halfSize, z - halfSize, z + halfSize, TILE_CONSTANTS.GRID_CELL_SIZE),
        cells: tilePlacementCells(tile).map(({ x: cx, z: cz, level }) => ({ x: cx, z: cz, level })),
      };
    });
    for (const { id } of previous) this.unindexTile(id);
    for (const { id, meta, keys, cells } of entries) {
      this.unindexTile(id);
      this.tileMeta.set(id, meta);
      insertCellKeys(this.tileIndex, this.tileCells, id, keys);
      this.occupy(id, cells);
    }
  }

  indexTile(tile: TileConfig): void {
    this.replaceTiles([], [tile]);
  }

  unindexTile(id: string): void {
    unindexId(this.tileIndex, this.tileCells, id);
    this.tileMeta.delete(id);
    this.vacate(id);
  }

  /**
   * Swaps the entries of `previous` walls for `next` ones, all or nothing like `replaceTiles`. Walls are found
   * around their center: `hasWallCollision` meets walls on one edge there, facing either way.
   */
  replaceWalls(previous: readonly { id: string }[], next: readonly Pick<WallConfig, 'id' | 'position' | 'rotation'>[]): void {
    const entries = next.map((wall) => {
      const [x, , z] = wallBox(wall).center;
      return {
        id: wall.id,
        meta: { x: wall.position.x, z: wall.position.z, rotY: wall.rotation.y },
        keys: aabbCellKeys(x - WALL_INDEX_TOLERANCE, x + WALL_INDEX_TOLERANCE, z - WALL_INDEX_TOLERANCE, z + WALL_INDEX_TOLERANCE, 1),
      };
    });
    for (const { id } of previous) this.unindexWall(id);
    for (const { id, meta, keys } of entries) {
      this.unindexWall(id);
      this.wallMeta.set(id, meta);
      insertCellKeys(this.wallIndex, this.wallCells, id, keys);
    }
  }

  indexWall(wall: Pick<WallConfig, 'id' | 'position' | 'rotation'>): void {
    this.replaceWalls([], [wall]);
  }

  unindexWall(id: string): void {
    unindexId(this.wallIndex, this.wallCells, id);
    this.wallMeta.delete(id);
  }

  occupy(id: string, cells: readonly CellCoord[]): void {
    this.vacate(id);
    for (const cell of cells) {
      const key = pair(cell.x, cell.z);
      const ids = this.placementColumns.get(key);
      if (ids) ids.add(id);
      else this.placementColumns.set(key, new Set([id]));
    }
    this.placementCells.set(id, cells);
  }

  vacate(id: string): void {
    const cells = this.placementCells.get(id);
    if (!cells) return;
    for (const cell of cells) {
      const key = pair(cell.x, cell.z);
      const ids = this.placementColumns.get(key);
      if (ids?.delete(id) && ids.size === 0) this.placementColumns.delete(key);
    }
    this.placementCells.delete(id);
  }

  /** Same answer as the placement engine's no-overlap rule, from the candidate columns instead of a rebuilt engine. */
  isOccupied(cells: readonly CellCoord[], ignoreId: string): boolean {
    for (const cell of cells) {
      const ids = this.placementColumns.get(pair(cell.x, cell.z));
      if (!ids) continue;
      for (const id of ids) {
        if (id === ignoreId) continue;
        for (const other of this.placementCells.get(id)!) {
          if (other.x === cell.x && other.z === cell.z && other.level === cell.level) return true;
        }
      }
    }
    return false;
  }
}
