import type { CellCoord } from '../../grid';
import { indexAabb, pair, unindexId, type TileMeta, type WallMeta } from '../model';
import { tileWorldSize, wallBox } from '../model/footprint';
import { tilePlacementCells, WALL_INDEX_TOLERANCE } from '../model/placement';
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

  /** Indexes a stored tile for support heights and placement; cells are copied so a draft never lands here. */
  indexTile(tile: TileConfig): void {
    this.unindexTile(tile.id);
    const { x, y, z } = tile.position;
    const halfSize = tileWorldSize(tile) / 2;
    this.tileMeta.set(tile.id, { x, z, y, halfSize });
    indexAabb(this.tileIndex, this.tileCells, tile.id, x - halfSize, x + halfSize, z - halfSize, z + halfSize, TILE_CONSTANTS.GRID_CELL_SIZE);
    this.occupy(tile.id, tilePlacementCells(tile).map(({ x: cx, z: cz, level }) => ({ x: cx, z: cz, level })));
  }

  unindexTile(id: string): void {
    unindexId(this.tileIndex, this.tileCells, id);
    this.tileMeta.delete(id);
    this.vacate(id);
  }

  /** Indexes a wall around its center; `hasWallCollision` finds walls on one edge there, facing either way. */
  indexWall(wall: Pick<WallConfig, 'id' | 'position' | 'rotation'>): void {
    this.unindexWall(wall.id);
    const [x, , z] = wallBox(wall).center;
    this.wallMeta.set(wall.id, { x: wall.position.x, z: wall.position.z, rotY: wall.rotation.y });
    indexAabb(this.wallIndex, this.wallCells, wall.id, x - WALL_INDEX_TOLERANCE, x + WALL_INDEX_TOLERANCE, z - WALL_INDEX_TOLERANCE, z + WALL_INDEX_TOLERANCE, 1);
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
