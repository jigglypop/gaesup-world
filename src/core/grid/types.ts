export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type CellCoord = {
  x: number;
  z: number;
  level: number;
};

export type EdgeSide = 'north' | 'east' | 'south' | 'west';

export type EdgeCoord = {
  x: number;
  z: number;
  level: number;
  side: EdgeSide;
};

export type CornerCoord = {
  x: number;
  z: number;
  level: number;
};

export type FreePlacementCoord = {
  position: Vec3;
  rotation?: Vec3;
};

export type GridAdapter<TCoord = unknown> = {
  id: string;
  toWorld(coord: TCoord): Vec3;
  fromWorld(position: Vec3): TCoord;
  getNeighbors(coord: TCoord): TCoord[];
  equals(a: TCoord, b: TCoord): boolean;
  key(coord: TCoord): string;
};

export type SquareGridSpec = {
  cellSize: number;
  heightStep: number;
  origin: 'center' | 'corner';
};

export type SquareGridAdapterOptions = {
  id?: string;
  spec?: Partial<SquareGridSpec>;
};

export type FreePlacementAdapterOptions = {
  id?: string;
  precision?: number;
};

