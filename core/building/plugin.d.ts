import type { GaesupPlugin } from '../plugins';
import { buildingGroupsToPlacementEntries, buildingPlacementAdapter, blockToPlacementEntry, createBuildingPlacementEngine, tileToPlacementEntry, wallToPlacementEntry } from './model';
import { useBuildingStore } from './stores/buildingStore';
import type { BuildingSerializedState } from './types';
export interface BuildingPlacementExtension {
    adapter: typeof buildingPlacementAdapter;
    createEngine: typeof createBuildingPlacementEngine;
    toEntries: typeof buildingGroupsToPlacementEntries;
    blockToEntry: typeof blockToPlacementEntry;
    tileToEntry: typeof tileToPlacementEntry;
    wallToEntry: typeof wallToPlacementEntry;
}
export interface BuildingSaveExtension {
    key: string;
    serialize: () => BuildingSerializedState;
    hydrate: (data: Partial<BuildingSerializedState> | null | undefined) => void;
}
export interface BuildingStoreService {
    useStore: typeof useBuildingStore;
    getState: typeof useBuildingStore.getState;
    setState: typeof useBuildingStore.setState;
}
export interface BuildingPluginOptions {
    id?: string;
    gridExtensionId?: string;
    placementExtensionId?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare const DEFAULT_BUILDING_GRID_EXTENSION_ID = "building.square";
export declare const DEFAULT_BUILDING_PLACEMENT_EXTENSION_ID = "building.placement";
export declare const DEFAULT_BUILDING_SAVE_EXTENSION_ID = "building";
export declare const DEFAULT_BUILDING_STORE_SERVICE_ID = "building.store";
declare module '../plugins' {
    interface SaveExtensionMap {
        building: BuildingSaveExtension;
    }
    interface ServiceExtensionMap {
        'building.store': BuildingStoreService;
    }
}
export declare function createBuildingPlugin(options?: BuildingPluginOptions): GaesupPlugin;
export declare const buildingPlugin: GaesupPlugin;
