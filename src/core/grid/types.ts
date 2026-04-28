export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface CellCoord {
  x: number;
  z: number;
  level: number;
}

export type EdgeSide = 'north' | 'east' | 'south' | 'west';

export interface EdgeCoord {
  x: number;
  z: number;
  level: number;
  side: EdgeSide;
}

export interface CornerCoord {
  x: number;
  z: number;
  level: number;
}

export interface FreePlacementCoord {
  position: Vec3;
  rotation?: Vec3;
}

export interface GridAdapter<TCoord = unknown> {
  id: string;
  toWorld(coord: TCoord): Vec3;
  fromWorld(position: Vec3): TCoord;
  getNeighbors(coord: TCoord): TCoord[];
  equals(a: TCoord, b: TCoord): boolean;
  key(coord: TCoord): string;
}

export interface SquareGridSpec {
  cellSize: number;
  heightStep: number;
  origin: 'center' | 'corner';
}

export interface SquareGridAdapterOptions {
  id?: string;
  spec?: Partial<SquareGridSpec>;
}

export interface FreePlacementAdapterOptions {
  id?: string;
  precision?: number;
}

