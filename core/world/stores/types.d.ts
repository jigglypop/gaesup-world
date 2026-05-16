import * as THREE from 'three';
import { InteractionEvent } from '@core/world/core/WorldSystem';
import { WorldObject } from '@core/world/types';
import { WorldBridge } from '../bridge/WorldBridge';
export interface WorldSliceState {
    objects: WorldObject[];
    selectedObjectId?: string | undefined;
    interactionMode: 'view' | 'edit' | 'interact';
    showDebugInfo: boolean;
    events: InteractionEvent[];
    loading: boolean;
    error?: string | undefined;
}
export interface WorldSlice extends WorldSliceState {
    addObject: (object: Omit<WorldObject, 'id'>) => string;
    removeObject: (objectId: string) => boolean;
    updateObject: (objectId: string, updates: Partial<Omit<WorldObject, 'id'>>) => boolean;
    selectObject: (objectId?: string) => void;
    setInteractionMode: (mode: 'view' | 'edit' | 'interact') => void;
    toggleDebugInfo: () => void;
    setError: (error?: string) => void;
    setLoading: (loading: boolean) => void;
    clearEvents: () => void;
    getBridge: () => WorldBridge | null;
    getObjectsInRadius: (center: THREE.Vector3, radius: number) => WorldObject[];
    getObjectsByType: (type: WorldObject['type']) => WorldObject[];
    raycast: (origin: THREE.Vector3, direction: THREE.Vector3) => WorldObject | null;
    interact: (objectId: string, action: string) => void;
    cleanup: () => void;
    addEvent?: (event: InteractionEvent) => void;
    loadState?: (state: Partial<WorldSliceState>) => void;
    saveState?: () => Partial<WorldSliceState>;
}
