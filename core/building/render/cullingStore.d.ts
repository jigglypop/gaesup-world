type BuildingGpuCullingState = {
    active: boolean;
    version: number;
    visibleTileGroupIds: Set<string>;
    visibleWallGroupIds: Set<string>;
    visibleBlockIds: Set<string>;
    visibleObjectIds: Set<string>;
    clusterCounts: Uint32Array;
    setResult: (payload: {
        version: number;
        tileIds: Set<string>;
        wallIds: Set<string>;
        blockIds?: Set<string>;
        objectIds: Set<string>;
        clusterCounts: Uint32Array;
    }) => void;
    reset: () => void;
};
export declare const useBuildingGpuCullingStore: import("zustand").UseBoundStore<import("zustand").StoreApi<BuildingGpuCullingState>>;
export {};
