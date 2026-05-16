import * as THREE from 'three';
export type SpatialGridOptions = {
    cellSize?: number;
    worldBounds?: {
        min: THREE.Vector3;
        max: THREE.Vector3;
    };
};
export declare class SpatialGrid {
    private cellSize;
    private cells;
    private objectPositions;
    constructor(options?: SpatialGridOptions);
    private static zigZag;
    private static pair;
    private getCellKey;
    add(id: string, position: THREE.Vector3): void;
    remove(id: string): void;
    update(id: string, newPosition: THREE.Vector3): void;
    getNearby(position: THREE.Vector3, radius: number, out?: string[]): string[];
    clear(): void;
    get size(): number;
}
