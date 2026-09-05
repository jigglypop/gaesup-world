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
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerX = Math.floor(position.x / this.cellSize);
    const centerZ = Math.floor(position.z / this.cellSize);
    const radiusSq = radius * radius;

    for (let x = centerX - cellRadius; x <= centerX + cellRadius; x++) {
      for (let z = centerZ - cellRadius; z <= centerZ + cellRadius; z++) {
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