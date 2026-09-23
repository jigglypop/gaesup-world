import { Box3 } from 'three';

type CellRange = { minX: number; maxX: number; minZ: number; maxZ: number };
type Entry = { id: string; bounds: Box3; range: CellRange | null };

function hasNaN(bounds: Box3): boolean {
  return Number.isNaN(bounds.min.x) || Number.isNaN(bounds.min.y) || Number.isNaN(bounds.min.z)
    || Number.isNaN(bounds.max.x) || Number.isNaN(bounds.max.y) || Number.isNaN(bounds.max.z);
}

/** World-space AABB broad phase. Large bounds use a bounded overflow path. */
export class BoundsIndex {
  private readonly entries = new Map<string, Entry>();
  private readonly columns = new Map<number, Map<number, Set<Entry>>>();
  private readonly overflow = new Set<Entry>();
  private readonly visited = new Set<Entry>();

  constructor(private readonly cellSize = 10, private readonly maxCells = 256) {
    if (!Number.isFinite(cellSize) || cellSize <= 0 || !Number.isSafeInteger(maxCells) || maxCells < 1) {
      throw new RangeError('Bounds index requires a positive cell size and cell budget');
    }
  }

  private range(bounds: Box3): CellRange | null {
    const minX = Math.floor(bounds.min.x / this.cellSize);
    const maxX = Math.floor(bounds.max.x / this.cellSize);
    const minZ = Math.floor(bounds.min.z / this.cellSize);
    const maxZ = Math.floor(bounds.max.z / this.cellSize);
    if (!Number.isSafeInteger(minX) || !Number.isSafeInteger(maxX)
      || !Number.isSafeInteger(minZ) || !Number.isSafeInteger(maxZ)
      || (maxX - minX + 1) * (maxZ - minZ + 1) > this.maxCells) return null;
    return { minX, maxX, minZ, maxZ };
  }

  update(id: string, bounds?: Box3): void {
    if (!bounds || bounds.isEmpty() || hasNaN(bounds)) {
      this.remove(id);
      return;
    }
    const previous = this.entries.get(id);
    if (previous?.bounds.equals(bounds)) return;
    const range = this.range(bounds);
    const old = previous?.range;
    if (previous && ((old === null && range === null) || (old && range
      && old.minX === range.minX && old.maxX === range.maxX
      && old.minZ === range.minZ && old.maxZ === range.maxZ))) {
      previous.bounds.copy(bounds);
      return;
    }
    this.remove(id);
    const entry: Entry = { id, bounds: bounds.clone(), range };
    this.entries.set(id, entry);
    if (!range) {
      this.overflow.add(entry);
      return;
    }
    for (let x = range.minX; x <= range.maxX; x++) {
      let column = this.columns.get(x);
      if (!column) this.columns.set(x, column = new Map());
      for (let z = range.minZ; z <= range.maxZ; z++) {
        let cell = column.get(z);
        if (!cell) column.set(z, cell = new Set());
        cell.add(entry);
      }
    }
  }

  remove(id: string): void {
    const entry = this.entries.get(id);
    if (!entry) return;
    this.entries.delete(id);
    this.overflow.delete(entry);
    const range = entry.range;
    if (!range) return;
    for (let x = range.minX; x <= range.maxX; x++) {
      const column = this.columns.get(x);
      if (!column) continue;
      for (let z = range.minZ; z <= range.maxZ; z++) {
        const cell = column.get(z);
        cell?.delete(entry);
        if (cell?.size === 0) column.delete(z);
      }
      if (column.size === 0) this.columns.delete(x);
    }
  }

  query(bounds: Box3, out: string[] = []): string[] {
    out.length = 0;
    if (bounds.isEmpty() || hasNaN(bounds)) return out;
    const range = this.range(bounds);
    if (!range) {
      for (const entry of this.entries.values()) {
        if (bounds.intersectsBox(entry.bounds)) out.push(entry.id);
      }
      return out;
    }
    this.visited.clear();
    for (let x = range.minX; x <= range.maxX; x++) {
      const column = this.columns.get(x);
      if (!column) continue;
      for (let z = range.minZ; z <= range.maxZ; z++) {
        const cell = column.get(z);
        if (!cell) continue;
        for (const entry of cell) {
          if (this.visited.has(entry)) continue;
          this.visited.add(entry);
          if (bounds.intersectsBox(entry.bounds)) out.push(entry.id);
        }
      }
    }
    for (const entry of this.overflow) {
      if (bounds.intersectsBox(entry.bounds)) out.push(entry.id);
    }
    this.visited.clear();
    return out;
  }

  clear(): void {
    this.entries.clear();
    this.columns.clear();
    this.overflow.clear();
    this.visited.clear();
  }
}
