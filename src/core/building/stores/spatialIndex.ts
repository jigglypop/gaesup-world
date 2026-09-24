import type { CellCoord } from '../../grid';
import { pair, type TileMeta, type WallMeta } from '../model';

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
