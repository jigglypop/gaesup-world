import type {
  CellCoord,
  CornerCoord,
  EdgeCoord,
  GridAdapter,
  SquareGridAdapterOptions,
  SquareGridSpec,
  Vec3,
} from './types';

export const DEFAULT_SQUARE_GRID_SPEC: SquareGridSpec = Object.freeze({
  cellSize: 4,
  heightStep: 1,
  origin: 'center',
});

export class SquareGridAdapter implements GridAdapter<CellCoord> {
  readonly id: string;
  readonly spec: SquareGridSpec;

  constructor(options: SquareGridAdapterOptions = {}) {
    this.id = options.id ?? 'square';
    this.spec = {
      ...DEFAULT_SQUARE_GRID_SPEC,
      ...options.spec,
    };
  }

  toWorld(coord: CellCoord): Vec3 {
    const offset = this.spec.origin === 'center' ? 0 : this.spec.cellSize / 2;
    return {
      x: coord.x * this.spec.cellSize + offset,
      y: coord.level * this.spec.heightStep,
      z: coord.z * this.spec.cellSize + offset,
    };
  }

  fromWorld(position: Vec3): CellCoord {
    const offset = this.spec.origin === 'center' ? 0 : this.spec.cellSize / 2;
    return {
      x: Math.round((position.x - offset) / this.spec.cellSize),
      z: Math.round((position.z - offset) / this.spec.cellSize),
      level: Math.round(position.y / this.spec.heightStep),
    };
  }

  getNeighbors(coord: CellCoord): CellCoord[] {
    return [
      { x: coord.x, z: coord.z - 1, level: coord.level },
      { x: coord.x + 1, z: coord.z, level: coord.level },
      { x: coord.x, z: coord.z + 1, level: coord.level },
      { x: coord.x - 1, z: coord.z, level: coord.level },
    ];
  }

  equals(a: CellCoord, b: CellCoord): boolean {
    return a.x === b.x && a.z === b.z && a.level === b.level;
  }

  key(coord: CellCoord): string {
    return `${coord.x}:${coord.z}:${coord.level}`;
  }

  edgeToWorld(edge: EdgeCoord): Vec3 {
    const center = this.toWorld(edge);
    const half = this.spec.cellSize / 2;
    switch (edge.side) {
      case 'north':
        return { ...center, z: center.z - half };
      case 'east':
        return { ...center, x: center.x + half };
      case 'south':
        return { ...center, z: center.z + half };
      case 'west':
        return { ...center, x: center.x - half };
    }
  }

  edgeKey(edge: EdgeCoord): string {
    return `${edge.x}:${edge.z}:${edge.level}:${edge.side}`;
  }

  cornerToWorld(corner: CornerCoord): Vec3 {
    const cell = this.toWorld(corner);
    const half = this.spec.cellSize / 2;
    return {
      x: cell.x - half,
      y: cell.y,
      z: cell.z - half,
    };
  }

  cornerKey(corner: CornerCoord): string {
    return `${corner.x}:${corner.z}:${corner.level}`;
  }
}

