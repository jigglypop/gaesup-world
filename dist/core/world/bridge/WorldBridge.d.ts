import { WorldObject, InteractionEvent } from '../core/WorldEngine';
import * as THREE from 'three';
export interface WorldState {
    objects: WorldObject[];
    selectedObjectId?: string;
    interactionMode: 'view' | 'edit' | 'interact';
    showDebugInfo: boolean;
    events: InteractionEvent[];
}
export interface WorldActions {
    addObject: (object: Omit<WorldObject, 'id'>) => string;
    removeObject: (id: string) => boolean;
    updateObject: (id: string, updates: Partial<WorldObject>) => boolean;
    selectObject: (id?: string) => void;
    setInteractionMode: (mode: WorldState['interactionMode']) => void;
    toggleDebugInfo: () => void;
    interact: (objectId: string, action: string) => void;
    raycast: (origin: THREE.Vector3, direction: THREE.Vector3) => WorldObject | null;
}
export declare class WorldBridge {
    private engine;
    private state;
    private stateUpdateCallback?;
    constructor();
    setStateUpdateCallback(callback: (state: WorldState) => void): void;
    addObject(object: Omit<WorldObject, 'id'>): string;
    removeObject(id: string): boolean;
    updateObject(id: string, updates: Partial<WorldObject>): boolean;
    selectObject(id?: string): void;
    setInteractionMode(mode: WorldState['interactionMode']): void;
    toggleDebugInfo(): void;
    interact(objectId: string, action: string): void;
    raycast(origin: THREE.Vector3, direction: THREE.Vector3): WorldObject | null;
    getObjectsInRadius(center: THREE.Vector3, radius: number): WorldObject[];
    getObjectsByType(type: WorldObject['type']): WorldObject[];
    getState(): WorldState;
    cleanup(): void;
    private updateState;
    private generateId;
}
