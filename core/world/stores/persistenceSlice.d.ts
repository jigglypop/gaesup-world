import { StateCreator } from 'zustand';
import type { SaveSystem } from '../../save';
import { SaveLoadManager } from '../persistence/SaveLoadManager';
import { CameraSaveData, NPCSaveData, SaveData, SaveLoadOptions, SaveMetadata, WorldSaveData } from '../persistence/types';
export type StoreApi<TState> = {
    getState: () => TState;
};
export type BuildingStoreState = {
    wallGroups: Map<string, WorldSaveData['buildings']['wallGroups'][number]>;
    tileGroups: Map<string, WorldSaveData['buildings']['tileGroups'][number]>;
    meshes: Map<string, WorldSaveData['buildings']['meshes'][number]>;
    blocks: NonNullable<WorldSaveData['buildings']['blocks']>;
    hydrate?: (data: WorldSaveData['buildings']) => void;
};
export type NPCStoreState = {
    instances: Map<string, NPCSaveData>;
};
export type CameraStoreState = {
    position: CameraSaveData['position'];
    rotation: CameraSaveData['rotation'];
    mode: CameraSaveData['mode'];
    settings: CameraSaveData['settings'];
};
export type GaesupStores = {
    buildingStore?: StoreApi<BuildingStoreState>;
    npcStore?: StoreApi<NPCStoreState>;
    cameraStore?: StoreApi<CameraStoreState> & {
        setState: (state: Partial<CameraStoreState>) => void;
    };
};
export type PersistenceStoresResolver = () => GaesupStores;
export interface PersistenceSliceOptions {
    getStores?: PersistenceStoresResolver;
    saveLoadManager?: SaveLoadManager;
    saveSystem?: SaveSystem;
}
export interface PersistenceState {
    saveLoadManager: SaveLoadManager;
    currentSaveId: string | null;
    saves: Array<{
        id: string;
        timestamp: number;
        metadata?: SaveMetadata;
    }>;
    isSaving: boolean;
    isLoading: boolean;
    lastError: string | null;
    saveWorld: (worldId: string, worldName: string, metadata?: Partial<SaveMetadata>, options?: SaveLoadOptions) => Promise<void>;
    loadWorld: (saveId: string, options?: SaveLoadOptions) => Promise<SaveData | null>;
    saveToFile: (worldId: string, worldName: string, filename: string, metadata?: Partial<SaveMetadata>, options?: SaveLoadOptions) => Promise<void>;
    loadFromFile: (file: File, options?: SaveLoadOptions) => Promise<SaveData | null>;
    refreshSaveList: () => void;
    deleteSave: (saveId: string) => void;
    clearError: () => void;
}
export declare function createPersistenceSliceWithOptions(options?: PersistenceSliceOptions): StateCreator<PersistenceState>;
export declare const createPersistenceSlice: StateCreator<PersistenceState>;
