import * as THREE from 'three';

export type SpatialGridOptions = {
  cellSize?: number;
  worldBounds?: { min: THREE.Vector3; max: THREE.Vector3 };
};

export class SpatialGrid {
  private cellSize: number;
  private cells: Map<number, Set<string>> = new Map();
  private objectPositions: Map<string, THREE.Vector3> = new Map();

  constructor(options: SpatialGridOptions = {}) {
    this.cellSize = options.cellSize ?? 10;
    if (!Number.isFinite(this.cellSize) || this.cellSize <= 0) throw new RangeError('Spatial grid cell size must be positive and finite');
  }

  private static zigZag(n: number): number {
    // Map signed integer -> non-negative integer (0, 1, 2, ...).
    return n >= 0 ? n * 2 : (-n * 2) - 1;
  }

  private static pair(a: number, b: number): number {
    // Cantor pairing on non-negative ints, after zig-zagging signed coords.
    // Keeps cell keys numeric to avoid per-query string allocations.
    const A = SpatialGrid.zigZag(a);
    const B = SpatialGrid.zigZag(b);
    const sum = A + B;
    return (sum * (sum + 1)) / 2 + B;
  }

  private getCellKey(x: number, z: number): number {
    const cellX = Math.floor(x / this.cellSize);
    const cellZ = Math.floor(z / this.cellSize);
    return SpatialGrid.pair(cellX, cellZ);
  }

  add(id: string, position: THREE.Vector3): void {
    this.remove(id);
    
    const key = this.getCellKey(position.x, position.z);
    if (!this.cells.has(key)) {
      this.cells.set(key, new Set());
    }
    this.cells.get(key)!.add(id);
    this.objectPositions.set(id, position.clone());
  }

  remove(id: string): void {
    const oldPosition = this.objectPositions.get(id);
    if (oldPosition) {
      const key = this.getCellKey(oldPosition.x, oldPosition.z);
      const cell = this.cells.get(key);
      if (cell) {
        cell.delete(id);
        if (cell.size === 0) {
          this.cells.delete(key);
        }
      }
      this.objectPositions.delete(id);
    }
  }

  update(id: string, newPosition: THREE.Vector3): void {
    const oldPosition = this.objectPositions.get(id);
    if (!oldPosition) {
      this.add(id, newPosition);
      return;
    }
    if (oldPosition.equals(newPosition)) return;

    const prevKey = this.getCellKey(oldPosition.x, oldPosition.z);
    const nextKey = this.getCellKey(newPosition.x, newPosition.z);

    // Only update cell membership when the object crossed a cell boundary.
    if (prevKey !== nextKey) {
      const prevCell = this.cells.get(prevKey);
      if (prevCell) {
        prevCell.delete(id);
        if (prevCell.size === 0) this.cells.delete(prevKey);
      }

      const nextCell = this.cells.get(nextKey) ?? new Set<string>();
      nextCell.add(id);
      this.cells.set(nextKey, nextCell);
    }

    // Reuse the stored Vector3 to avoid per-update allocations.
    oldPosition.copy(newPosition);
  }

  getNearby(position: THREE.Vector3, radius: number, out?: string[]): string[] {
    const result = out ?? [];
    if (out) out.length = 0;
    if (Number.isNaN(radius) || radius < 0 || !Number.isFinite(position.x)
      || !Number.isFinite(position.y) || !Number.isFinite(position.z)) return result;
    const minX = Math.floor((position.x - radius) / this.cellSize);
    const maxX = Math.floor((position.x + radius) / this.cellSize);
    const minZ = Math.floor((position.z - radius) / this.cellSize);
    const maxZ = Math.floor((position.z + radius) / this.cellSize);
    const radiusSq = radius * radius;

    // Bound empty-cell traversal and avoid imprecise numeric keys at extreme coordinates.
    if ((maxX - minX + 1) * (maxZ - minZ + 1) > Math.min(4096, Math.max(16, this.size * 4))
      || Math.abs(minX) > 2 ** 24 || Math.abs(maxX) > 2 ** 24
      || Math.abs(minZ) > 2 ** 24 || Math.abs(maxZ) > 2 ** 24) {
      for (const [id, objectPos] of this.objectPositions) {
        if (Math.hypot(position.x - objectPos.x, position.y - objectPos.y, position.z - objectPos.z) <= radius) result.push(id);
      }
      return result;
    }

    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        const key = SpatialGrid.pair(x, z);
        const cell = this.cells.get(key);
        if (cell) {
          for (const id of cell) {
            const objectPos = this.objectPositions.get(id);
            if (!objectPos) continue;
            const dx = position.x - objectPos.x;
            const dy = position.y - objectPos.y;
            const dz = position.z - objectPos.z;
            if (dx * dx + dy * dy + dz * dz <= radiusSq) {
              result.push(id);
            }
          }
        }
      }
    }

    return result;
  }

  clear(): void {
    this.cells.clear();
    this.objectPositions.clear();
  }

  get size(): number {
    return this.objectPositions.size;
  }
}
