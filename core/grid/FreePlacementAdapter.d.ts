import type { FreePlacementAdapterOptions, FreePlacementCoord, GridAdapter, Vec3 } from './types';
export declare class FreePlacementAdapter implements GridAdapter<FreePlacementCoord> {
    readonly id: string;
    private readonly precision;
    constructor(options?: FreePlacementAdapterOptions);
    toWorld(coord: FreePlacementCoord): Vec3;
    fromWorld(position: Vec3): FreePlacementCoord;
    getNeighbors(coord: FreePlacementCoord): FreePlacementCoord[];
    equals(a: FreePlacementCoord, b: FreePlacementCoord): boolean;
    key(coord: FreePlacementCoord): string;
    private quantize;
}
