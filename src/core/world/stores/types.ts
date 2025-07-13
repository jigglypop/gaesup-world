import { WorldObject } from '@core/world/types';
import { InteractionEvent } from '@core/world/core/WorldEngine';
import { WorldBridge } from '../bridge/WorldBridge';
import * as THREE from 'three';

export interface WorldSliceState {
  objects: WorldObject[];
  selectedObjectId?: string;
  interactionMode: 'view' | 'edit' | 'interact';
  showDebugInfo: boolean;
  events: InteractionEvent[];
  loading: boolean;
  error?: string;
}

export interface WorldSlice extends WorldSliceState {
  addObject: (object: Omit<WorldObject, 'id'>) => string;
  removeObject: (objectId: string) => boolean;
  updateObject: (
    objectId: string,
    updates: Partial<Omit<WorldObject, 'id'>>
  ) => boolean;
  selectObject: (objectId?: string) => void;
  setInteractionMode: (mode: 'view' | 'edit' | 'interact') => void;
  toggleDebugInfo: () => void;
  setError: (error?: string) => void;
  setLoading: (loading: boolean) => void;
  clearEvents: () => void;
  
  // 새로운 브릿지 관련 메서드들
  getBridge: () => WorldBridge | null;
  getObjectsInRadius: (center: THREE.Vector3, radius: number) => WorldObject[];
  getObjectsByType: (type: WorldObject['type']) => WorldObject[];
  raycast: (origin: THREE.Vector3, direction: THREE.Vector3) => WorldObject | null;
  interact: (objectId: string, action: string) => void;
  cleanup: () => void;
  
  // 레거시 호환성 (필요시 제거 가능)
  addEvent?: (event: InteractionEvent) => void;
  loadState?: (state: Partial<WorldSliceState>) => void;
  saveState?: () => Partial<WorldSliceState>;
}
