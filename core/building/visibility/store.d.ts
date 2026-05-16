type BuildingVisibilityState = {
    initialized: boolean;
    visibleTileGroupIds: Set<string>;
    visibleWallGroupIds: Set<string>;
    visibleBlockIds: Set<string>;
    visibleObjectIds: Set<string>;
    setVisible: (payload: {
        tileIds: Set<string>;
        wallIds: Set<string>;
        blockIds?: Set<string>;
        objectIds: Set<string>;
    }) => void;
    reset: () => void;
};
export declare const useBuildingVisibilityStore: import("zustand").UseBoundStore<import("zustand").StoreApi<BuildingVisibilityState>>;
export {};
