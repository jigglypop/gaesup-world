import { StateCreator } from 'zustand';

import type { SaveBlob, SaveSystem } from '../../save';
import { SaveLoadManager } from '../persistence/SaveLoadManager';
import {
  DEFAULT_WORLD_SAVE_ENVIRONMENT,
  createSaveDataFromSaveSystem,
  createWorldDataFromSaveDomains,
  normalizeSaveMetadata,
  parseWorldSaveTimestamp,
} from '../persistence/saveSystem';
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
  cameraStore?: StoreApi<CameraStoreState> & { setState: (state: Partial<CameraStoreState>) => void };
};

export type PersistenceStoresResolver = () => GaesupStores;

export interface PersistenceSliceOptions {
  getStores?: PersistenceStoresResolver;
  saveLoadManager?: SaveLoadManager;
  saveSystem?: SaveSystem;
}

const EMPTY_STORES_RESOLVER: PersistenceStoresResolver = () => ({});

type SaveSystemFileData = {
  kind: 'gaesup.save-system';
  version: 1;
  worldId: string;
  worldName: string;
  blob: SaveBlob;
  metadata?: Partial<SaveMetadata>;
};

function createWorldData(
  stores: GaesupStores,
  worldId: string,
  worldName: string,
): WorldSaveData {
  const { buildingStore, npcStore, cameraStore } = stores;

  if (!buildingStore) {
    throw new Error('Building store not initialized');
  }

  const buildingState = buildingStore.getState();
  const cameraState = cameraStore?.getState();
  const camera = cameraState ? {
    position: cameraState.position,
    rotation: cameraState.rotation,
    mode: cameraState.mode,
    ...(cameraState.settings ? { settings: cameraState.settings } : {}),
  } : undefined;

  const worldData: WorldSaveData = {
    id: worldId,
    name: worldName,
    buildings: {
      wallGroups: Array.from(buildingState.wallGroups.values()),
      tileGroups: Array.from(buildingState.tileGroups.values()),
      blocks: Array.from(buildingState.blocks),
      meshes: Array.from(buildingState.meshes.values()),
    },
    npcs: npcStore ? Array.from(npcStore.getState().instances.values()) : [],
    environment: DEFAULT_WORLD_SAVE_ENVIRONMENT,
    ...(camera ? { camera } : {}),
  };

  return worldData;
}

function hydrateBuildingStore(
  buildingStore: StoreApi<BuildingStoreState> | undefined,
  buildings: WorldSaveData['buildings'] | undefined,
): void {
  if (!buildingStore || !buildings) return;

  const state = buildingStore.getState();
  if (typeof state.hydrate === 'function') {
    state.hydrate(buildings);
    return;
  }

  state.wallGroups.clear();
  state.tileGroups.clear();
  state.meshes.clear();
  state.blocks = [];

  buildings.wallGroups.forEach((group) => {
    state.wallGroups.set(group.id, group);
  });

  buildings.tileGroups.forEach((group) => {
    state.tileGroups.set(group.id, group);
  });

  buildings.meshes.forEach((mesh) => {
    state.meshes.set(mesh.id, mesh);
  });

  state.blocks = [...(buildings.blocks ?? [])];
}

function hydrateNpcStore(
  npcStore: StoreApi<NPCStoreState> | undefined,
  npcs: NPCSaveData[] | undefined,
): void {
  if (!npcStore || !npcs) return;

  const state = npcStore.getState();
  state.instances.clear();

  npcs.forEach((npc) => {
    state.instances.set(npc.id, npc);
  });
}

function hydrateCameraStore(
  cameraStore: GaesupStores['cameraStore'],
  camera: WorldSaveData['camera'] | undefined,
): void {
  if (!cameraStore || !camera) return;

  cameraStore.setState({
    position: camera.position,
    rotation: camera.rotation,
    mode: camera.mode,
    settings: camera.settings || {},
  });
}

function hydrateStores(stores: GaesupStores, world: WorldSaveData): void {
  hydrateBuildingStore(stores.buildingStore, world.buildings);
  hydrateNpcStore(stores.npcStore, world.npcs);
  hydrateCameraStore(stores.cameraStore, world.camera);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stripJsonExtension(filename: string): string {
  return filename.replace(/\.json$/i, '');
}

function isSaveBlob(value: unknown): value is SaveBlob {
  return (
    isRecord(value) &&
    typeof value['version'] === 'number' &&
    typeof value['savedAt'] === 'number' &&
    isRecord(value['domains'])
  );
}

function isSaveSystemFileData(value: unknown): value is SaveSystemFileData {
  return (
    isRecord(value) &&
    value['kind'] === 'gaesup.save-system' &&
    typeof value['worldId'] === 'string' &&
    typeof value['worldName'] === 'string' &&
    isSaveBlob(value['blob'])
  );
}

async function listSaveSystemSaves(saveSystem: SaveSystem): Promise<Array<{ id: string; timestamp: number }>> {
  const saveIds = await saveSystem.list();
  return saveIds
    .map((id) => ({ id, timestamp: parseWorldSaveTimestamp(id) }))
    .sort((a, b) => b.timestamp - a.timestamp);
}

function downloadJsonFile(filename: string, data: unknown): void {
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof Blob === 'undefined') {
    throw new Error('File download is not available in this environment');
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function readSaveSystemFileData(file: File): Promise<SaveSystemFileData | SaveBlob> {
  const parsed = JSON.parse(await file.text()) as unknown;
  if (isSaveSystemFileData(parsed)) return parsed;
  if (isSaveBlob(parsed)) return parsed;
  throw new Error('Invalid SaveSystem file format');
}

export interface PersistenceState {
  saveLoadManager: SaveLoadManager;
  currentSaveId: string | null;
  saves: Array<{ id: string; timestamp: number; metadata?: SaveMetadata }>;
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

export function createPersistenceSliceWithOptions(
  options: PersistenceSliceOptions = {},
): StateCreator<PersistenceState> {
  const resolveStores = options.getStores ?? EMPTY_STORES_RESOLVER;
  const saveSystem = options.saveSystem;

  return (set, get) => ({
  saveLoadManager: options.saveLoadManager ?? new SaveLoadManager(),
  currentSaveId: null,
  saves: [],
  isSaving: false,
  isLoading: false,
  lastError: null,

  saveWorld: async (worldId, worldName, metadata, options) => {
    set({ isSaving: true, lastError: null });
    
    try {
      if (saveSystem) {
        const timestamp = Date.now();
        const saveId = `${worldId}_${timestamp}`;
        await saveSystem.save(saveId);
        set({
          currentSaveId: saveId,
          saves: await listSaveSystemSaves(saveSystem),
        });
        return;
      }

      const worldData = createWorldData(resolveStores(), worldId, worldName);

      const result = await get().saveLoadManager.save(worldData, metadata, options);
      
      if (result.success) {
        const saveId = `${worldId}_${result.data!.timestamp}`;
        set({ currentSaveId: saveId });
        get().refreshSaveList();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      set({ lastError: error instanceof Error ? error.message : 'Save failed' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  loadWorld: async (saveId, options) => {
    set({ isLoading: true, lastError: null });
    
    try {
      if (saveSystem) {
        const loaded = await saveSystem.load(saveId);
        if (!loaded) {
          throw new Error(`Save data not found: ${saveId}`);
        }

        set({ currentSaveId: saveId });
        return createSaveDataFromSaveSystem(saveSystem, saveId);
      }

      const result = await get().saveLoadManager.load(saveId, options);
      
      if (result.success && result.data) {
        hydrateStores(resolveStores(), result.data.world);
        
        set({ currentSaveId: saveId });
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      set({ lastError: error instanceof Error ? error.message : 'Load failed' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  saveToFile: async (worldId, worldName, filename, metadata, options) => {
    set({ isSaving: true, lastError: null });
    
    try {
      if (saveSystem) {
        const fileData: SaveSystemFileData = {
          kind: 'gaesup.save-system',
          version: 1,
          worldId,
          worldName,
          blob: saveSystem.createBlob(filename),
          ...(metadata ? { metadata } : {}),
        };
        downloadJsonFile(filename, fileData);
        return;
      }

      const worldData = createWorldData(resolveStores(), worldId, worldName);

      const result = await get().saveLoadManager.saveToFile(worldData, filename, metadata, options);
      
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      set({ lastError: error instanceof Error ? error.message : 'Save to file failed' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  loadFromFile: async (file, options) => {
    set({ isLoading: true, lastError: null });
    
    try {
      if (saveSystem) {
        const fileData = await readSaveSystemFileData(file);
        const blob = isSaveSystemFileData(fileData) ? fileData.blob : fileData;
        saveSystem.hydrateBlob(blob, file.name);

        const worldId = isSaveSystemFileData(fileData)
          ? fileData.worldId
          : stripJsonExtension(file.name);
        const worldName = isSaveSystemFileData(fileData)
          ? fileData.worldName
          : worldId;
        const timestamp = blob.savedAt;
        const loadedSaveData: SaveData = {
          version: String(blob.version),
          timestamp,
          world: createWorldDataFromSaveDomains(blob.domains, worldId, worldName),
        };
        const normalizedMetadata = isSaveSystemFileData(fileData)
          ? normalizeSaveMetadata(fileData.metadata, timestamp)
          : undefined;
        return normalizedMetadata
          ? { ...loadedSaveData, metadata: normalizedMetadata }
          : loadedSaveData;
      }

      const result = await get().saveLoadManager.loadFromFile(file, options);
      
      if (result.success && result.data) {
        hydrateStores(resolveStores(), result.data.world);
        
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      set({ lastError: error instanceof Error ? error.message : 'Load from file failed' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  refreshSaveList: () => {
    if (saveSystem) {
      void listSaveSystemSaves(saveSystem)
        .then((saves) => set({ saves }))
        .catch((error: unknown) => {
          set({ lastError: error instanceof Error ? error.message : 'Failed to list saves' });
        });
      return;
    }

    const saves = get().saveLoadManager.listSaves();
    set({ saves });
  },

  deleteSave: (saveId) => {
    if (saveSystem) {
      void (async () => {
        try {
          await saveSystem.remove(saveId);
          const saves = await listSaveSystemSaves(saveSystem);
          set({
            saves,
            ...(get().currentSaveId === saveId ? { currentSaveId: null } : {}),
          });
        } catch (error) {
          set({ lastError: error instanceof Error ? error.message : 'Failed to delete save' });
        }
      })();
      return;
    }

    const success = get().saveLoadManager.deleteSave(saveId);
    if (success) {
      get().refreshSaveList();
      if (get().currentSaveId === saveId) {
        set({ currentSaveId: null });
      }
    }
  },

  clearError: () => {
    set({ lastError: null });
  }
});
}

export const createPersistenceSlice: StateCreator<PersistenceState> = createPersistenceSliceWithOptions();
