import type { TileMeta, WallMeta } from '../model';

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
}
