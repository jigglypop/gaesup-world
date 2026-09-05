import { StateCreator } from 'zustand';

import { BridgeFactory } from '@core/boilerplate';

import { WorldSlice } from './types';
import { WorldBridge } from '../bridge/WorldBridge';

const DEFAULT_WORLD_ID = 'default';

export const createWorldSlice: StateCreator<WorldSlice> = (set) => {
  const worldBridge = BridgeFactory.getOrCreate<WorldBridge>('world');
  
  if (worldBridge) {
    // 기본 월드 엔진 등록
    worldBridge.register(DEFAULT_WORLD_ID);
    
    // 브릿지 상태 변경 구독
    // Prevent subscription leaks when the slice is recreated (e.g. HMR / multiple stores).
    const bridgeWithInternal = worldBridge as WorldBridge & {
      __gaesupWorldSliceUnsubscribe?: (() => void) | undefined;
    };
    bridgeWithInternal.__gaesupWorldSliceUnsubscribe?.();
    bridgeWithInternal.__gaesupWorldSliceUnsubscribe = worldBridge.subscribe((snapshot) => {
      set({
        objects: snapshot.objects,
        selectedObjectId: snapshot.selectedObjectId,
        interactionMode: snapshot.interactionMode,
        showDebugInfo: snapshot.showDebugInfo,
        events: snapshot.events,
        loading: false,
        error: undefined,
      });
    });
  }

  return {
    objects: [],
    selectedObjectId: undefined,
    interactionMode: 'view',
    showDebugInfo: false,
    events: [],
    loading: false,
    error: undefined,

    addObject: (object) => {
      if (!worldBridge) return '';
      
      set({ loading: true, error: undefined });
      try {
        const objectId = worldBridge.addObject(DEFAULT_WORLD_ID, object);
        set({ loading: false });
        return objectId;
      } catch (error) {
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        return '';
      }
    },

    removeObject: (id) => {
      if (!worldBridge) return false;
      
      set({ loading: true, error: undefined });
      try {
        worldBridge.removeObject(DEFAULT_WORLD_ID, id);
        set({ loading: false });
        return true;
      } catch (error) {
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        return false;
      }
    },

    updateObject: (id, updates) => {
      if (!worldBridge) return false;
      
      set({ loading: true, error: undefined });
      try {
        worldBridge.updateObject(DEFAULT_WORLD_ID, id, updates);
        set({ loading: false });
        return true;
      } catch (error) {
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        return false;
      }
    },

    selectObject: (id) => {
      if (!worldBridge) return;
      worldBridge.selectObject(DEFAULT_WORLD_ID, id);
    },

    setInteractionMode: (mode) => {
      if (!worldBridge) return;
      worldBridge.setInteractionMode(DEFAULT_WORLD_ID, mode);
    },

    toggleDebugInfo: () => {
      if (!worldBridge) return;
      worldBridge.toggleDebugInfo(DEFAULT_WORLD_ID);
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

    // 브릿지 인스턴스 접근 (고급 사용자용)
    getBridge: () => worldBridge,
    
    // 추가 조회 기능들
    getObjectsInRadius: (center, radius) => {
      if (!worldBridge) return [];
      return worldBridge.getObjectsInRadius(DEFAULT_WORLD_ID, center, radius);
    },
    
    getObjectsByType: (type) => {
      if (!worldBridge) return [];
      return worldBridge.getObjectsByType(DEFAULT_WORLD_ID, type);
    },
    
    raycast: (origin, direction) => {
      if (!worldBridge) return null;
      return worldBridge.raycast(DEFAULT_WORLD_ID, origin, direction);
    },
    
    interact: (objectId, action) => {
      if (!worldBridge) return;
      worldBridge.interact(DEFAULT_WORLD_ID, objectId, action);
    },
    
    cleanup: () => {
      if (!worldBridge) return;
      worldBridge.cleanup(DEFAULT_WORLD_ID);
    },
  };
};
