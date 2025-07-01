import { StateCreator } from 'zustand';
import { SaveLoadManager, SaveData, SaveLoadOptions, SaveMetadata } from '../persistence';

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

export const createPersistenceSlice: StateCreator<PersistenceState> = (set, get) => ({
  saveLoadManager: new SaveLoadManager(),
  currentSaveId: null,
  saves: [],
  isSaving: false,
  isLoading: false,
  lastError: null,

  saveWorld: async (worldId, worldName, metadata, options) => {
    set({ isSaving: true, lastError: null });
    
    try {
      const { buildingStore, npcStore, cameraStore } = (window as any).__gaesupStores || {};
      
      if (!buildingStore) {
        throw new Error('Building store not initialized');
      }

      const worldData = {
        id: worldId,
        name: worldName,
        buildings: {
          wallGroups: Array.from(buildingStore.getState().wallGroups.values()),
          tileGroups: Array.from(buildingStore.getState().tileGroups.values()),
          meshes: Array.from(buildingStore.getState().meshes.values()),
        },
        npcs: npcStore ? Array.from(npcStore.getState().instances.values()) : [],
        environment: {
          lighting: {
            ambientIntensity: 1,
            directionalIntensity: 1,
            directionalPosition: { x: 0, y: 10, z: 0 }
          }
        },
        camera: cameraStore ? {
          position: cameraStore.getState().position,
          rotation: cameraStore.getState().rotation,
          mode: cameraStore.getState().mode,
          settings: cameraStore.getState().settings
        } : undefined
      };

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
      const result = await get().saveLoadManager.load(saveId, options);
      
      if (result.success && result.data) {
        const { buildingStore, npcStore, cameraStore } = (window as any).__gaesupStores || {};
        
        if (buildingStore && result.data.world.buildings) {
          const state = buildingStore.getState();
          state.wallGroups.clear();
          state.tileGroups.clear();
          state.meshes.clear();
          
          result.data.world.buildings.wallGroups.forEach(group => {
            state.wallGroups.set(group.id, group);
          });
          
          result.data.world.buildings.tileGroups.forEach(group => {
            state.tileGroups.set(group.id, group);
          });
          
          result.data.world.buildings.meshes.forEach(mesh => {
            state.meshes.set(mesh.id, mesh);
          });
        }
        
        if (npcStore && result.data.world.npcs) {
          const state = npcStore.getState();
          state.instances.clear();
          
          result.data.world.npcs.forEach(npc => {
            state.instances.set(npc.id, npc);
          });
        }
        
        if (cameraStore && result.data.world.camera) {
          cameraStore.setState({
            position: result.data.world.camera.position,
            rotation: result.data.world.camera.rotation,
            mode: result.data.world.camera.mode,
            settings: result.data.world.camera.settings || {}
          });
        }
        
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
      const { buildingStore, npcStore, cameraStore } = (window as any).__gaesupStores || {};
      
      if (!buildingStore) {
        throw new Error('Building store not initialized');
      }

      const worldData = {
        id: worldId,
        name: worldName,
        buildings: {
          wallGroups: Array.from(buildingStore.getState().wallGroups.values()),
          tileGroups: Array.from(buildingStore.getState().tileGroups.values()),
          meshes: Array.from(buildingStore.getState().meshes.values()),
        },
        npcs: npcStore ? Array.from(npcStore.getState().instances.values()) : [],
        environment: {
          lighting: {
            ambientIntensity: 1,
            directionalIntensity: 1,
            directionalPosition: { x: 0, y: 10, z: 0 }
          }
        },
        camera: cameraStore ? {
          position: cameraStore.getState().position,
          rotation: cameraStore.getState().rotation,
          mode: cameraStore.getState().mode,
          settings: cameraStore.getState().settings
        } : undefined
      };

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
      const result = await get().saveLoadManager.loadFromFile(file, options);
      
      if (result.success && result.data) {
        const { buildingStore, npcStore, cameraStore } = (window as any).__gaesupStores || {};
        
        if (buildingStore && result.data.world.buildings) {
          const state = buildingStore.getState();
          state.wallGroups.clear();
          state.tileGroups.clear();
          state.meshes.clear();
          
          result.data.world.buildings.wallGroups.forEach(group => {
            state.wallGroups.set(group.id, group);
          });
          
          result.data.world.buildings.tileGroups.forEach(group => {
            state.tileGroups.set(group.id, group);
          });
          
          result.data.world.buildings.meshes.forEach(mesh => {
            state.meshes.set(mesh.id, mesh);
          });
        }
        
        if (npcStore && result.data.world.npcs) {
          const state = npcStore.getState();
          state.instances.clear();
          
          result.data.world.npcs.forEach(npc => {
            state.instances.set(npc.id, npc);
          });
        }
        
        if (cameraStore && result.data.world.camera) {
          cameraStore.setState({
            position: result.data.world.camera.position,
            rotation: result.data.world.camera.rotation,
            mode: result.data.world.camera.mode,
            settings: result.data.world.camera.settings || {}
          });
        }
        
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
    const saves = get().saveLoadManager.listSaves();
    set({ saves });
  },

  deleteSave: (saveId) => {
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