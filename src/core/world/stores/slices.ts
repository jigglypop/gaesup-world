import { StateCreator } from 'zustand';
import { WorldSlice, WorldSliceState } from './types';
import { WorldBridge } from '../bridge/WorldBridge';

const worldBridge = new WorldBridge();

export const createWorldSlice: StateCreator<WorldSlice> = (set, get) => {
  worldBridge.setStateUpdateCallback((state) => {
    set({
      objects: state.objects,
      selectedObjectId: state.selectedObjectId,
      interactionMode: state.interactionMode,
      showDebugInfo: state.showDebugInfo,
      events: state.events,
    });
  });

  return {
    objects: [],
    selectedObjectId: undefined,
    interactionMode: 'view',
    showDebugInfo: false,
    events: [],
    loading: false,
    error: undefined,

    addObject: (object) => {
      set({ loading: true, error: undefined });
      try {
        const id = worldBridge.addObject(object);
        set({ loading: false });
        return id;
      } catch (error) {
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        return '';
      }
    },

    removeObject: (id) => {
      set({ loading: true, error: undefined });
      try {
        const success = worldBridge.removeObject(id);
        set({ loading: false });
        return success;
      } catch (error) {
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        return false;
      }
    },

    updateObject: (id, updates) => {
      set({ loading: true, error: undefined });
      try {
        const success = worldBridge.updateObject(id, updates);
        set({ loading: false });
        return success;
      } catch (error) {
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        return false;
      }
    },

    selectObject: (id) => {
      worldBridge.selectObject(id);
    },

    setInteractionMode: (mode) => {
      worldBridge.setInteractionMode(mode);
    },

    toggleDebugInfo: () => {
      worldBridge.toggleDebugInfo();
    },

    setLoading: (loading) => {
      set({ loading });
    },

    setError: (error) => {
      set({ error });
    },

    clearEvents: () => {
      set({ events: [] });
    },
  };
};
