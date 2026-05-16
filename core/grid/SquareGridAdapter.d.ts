import type { CellCoord, CornerCoord, EdgeCoord, GridAdapter, SquareGridAdapterOptions, SquareGridSpec, Vec3 } from './types';
export declare const DEFAULT_SQUARE_GRID_SPEC: SquareGridSpec;
export declare class SquareGridAdapter implements GridAdapter<CellCoord> {
    readonly id: string;
    readonly spec: SquareGridSpec;
    constructor(options?: SquareGridAdapterOptions);
    toWorld(coord: CellCoord): Vec3;
    fromWorld(position: Vec3): CellCoord;
    getNeighbors(coord: CellCoord): CellCoord[];
    equals(a: CellCoord, b: CellCoord): boolean;
    key(coord: CellCoord): string;
    edgeToWorld(edge: EdgeCoord): Vec3;
    edgeKey(edge: EdgeCoord): string;
    cornerToWorld(corner: CornerCoord): Vec3;
    cornerKey(corner: CornerCoord): string;
}
