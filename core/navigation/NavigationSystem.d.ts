import * as THREE from 'three';
export interface NavigationConfig {
    cellSize: number;
    worldMinX: number;
    worldMinZ: number;
    worldMaxX: number;
    worldMaxZ: number;
    maxStepHeight: number;
}
export type Waypoint = [number, number, number];
export type NavigationAgentSize = {
    /**
     * Circular/capsule footprint radius in world units. This is usually the
     * Rapier capsule radius used by a character controller.
     */
    agentRadius?: number;
    /**
     * Optional rectangular footprint width in world units. When provided it is
     * combined with agentRadius and the wider value wins.
     */
    agentWidth?: number;
    /**
     * Optional rectangular footprint depth in world units. When provided it is
     * combined with agentRadius and the deeper value wins.
     */
    agentDepth?: number;
    /**
     * Extra world-unit padding around the agent. Useful for softer avoidance.
     */
    clearance?: number;
};
export type NavigationQueryOptions = NavigationAgentSize & {
    y?: number;
    weighted?: boolean;
};
export declare class NavigationSystem {
    private static instance;
    private config;
    private gridWidth;
    private gridHeight;
    private grid;
    private costGrid;
    private heightGrid;
    private hasHeightData;
    private hasBlockedData;
    private wasm;
    private ready;
    private gridPtr;
    private outPathPtr;
    private readonly outCapacity;
    private readonly traversalGridCacheLimit;
    private traversalGridCache;
    private traversalCostGridCache;
    private constructor();
    static getInstance(config?: Partial<NavigationConfig>): NavigationSystem;
    init(): Promise<boolean>;
    private syncGridToWasm;
    private syncToWasm;
    private cellIndex;
    private isGridCell;
    private setCell;
    worldToGrid(worldX: number, worldZ: number): [number, number];
    gridToWorld(gx: number, gz: number, y?: number): Waypoint;
    private resolveAgentFootprint;
    private getFootprintCacheKey;
    private invalidateTraversalCaches;
    private getCellBounds;
    private footprintOverlapsBlockedCell;
    private canOccupyCell;
    private createTraversalGrid;
    private createTraversalCostGrid;
    setBlocked(worldX: number, worldZ: number, width: number, depth: number): void;
    setWalkable(worldX: number, worldZ: number, width: number, depth: number): void;
    reset(value?: number): void;
    private setRegion;
    setCost(worldX: number, worldZ: number, cost: number): void;
    setHeight(worldX: number, worldZ: number, height: number): void;
    setHeightRegion(worldX: number, worldZ: number, width: number, depth: number, height: number): void;
    setHeightSampler(worldX: number, worldZ: number, width: number, depth: number, sampler: (worldX: number, worldZ: number) => number): void;
    sampleHeight(worldX: number, worldZ: number): number;
    hasNavigationConstraints(): boolean;
    setBlockedFromBox(box: THREE.Box3): void;
    findPath(startX: number, startZ: number, goalX: number, goalZ: number, y?: number | NavigationQueryOptions, weighted?: boolean): Waypoint[];
    private findPathWasm;
    private findPathJS;
    private octileH;
    private canStepBetween;
    hasLineOfSight(startX: number, startZ: number, goalX: number, goalZ: number, options?: NavigationAgentSize): boolean;
    canTraverseSegment(startX: number, startZ: number, goalX: number, goalZ: number, options?: NavigationAgentSize & {
        ignoreStart?: boolean;
    }): boolean;
    smoothPath(waypoints: Waypoint[], start?: Waypoint, goal?: Waypoint, options?: NavigationAgentSize): Waypoint[];
    simplifyPath(waypoints: Waypoint[]): Waypoint[];
    isWalkable(worldX: number, worldZ: number, options?: NavigationAgentSize): boolean;
    getGridDimensions(): {
        width: number;
        height: number;
        cellSize: number;
    };
    dispose(): void;
}
