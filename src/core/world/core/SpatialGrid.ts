import * as THREE from 'three';

export type SpatialGridOptions = {
  cellSize?: number;
  worldBounds?: { min: THREE.Vector3; max: THREE.Vector3 };
};

export class SpatialGrid {
  private cellSize: number;
  private cells: Map<string, Set<string>> = new Map();
  private objectPositions: Map<string, THREE.Vector3> = new Map();

  constructor(options: SpatialGridOptions = {}) {
    this.cellSize = options.cellSize ?? 10;
  }

  private getCellKey(x: number, z: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellZ = Math.floor(z / this.cellSize);
    return `${cellX},${cellZ}`;
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
    if (!oldPosition || !oldPosition.equals(newPosition)) {
      this.add(id, newPosition);
    }
  }

  getNearby(position: THREE.Vector3, radius: number): string[] {
    const result: Set<string> = new Set();
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerX = Math.floor(position.x / this.cellSize);
    const centerZ = Math.floor(position.z / this.cellSize);

    for (let x = centerX - cellRadius; x <= centerX + cellRadius; x++) {
      for (let z = centerZ - cellRadius; z <= centerZ + cellRadius; z++) {
        const key = `${x},${z}`;
        const cell = this.cells.get(key);
        if (cell) {
          cell.forEach(id => {
            const objectPos = this.objectPositions.get(id);
            if (objectPos && position.distanceTo(objectPos) <= radius) {
              result.add(id);
            }
          });
        }
      }
    }

    return Array.from(result);
  }

  clear(): void {
    this.cells.clear();
    this.objectPositions.clear();
  }

  get size(): number {
    return this.objectPositions.size;
  }
} 