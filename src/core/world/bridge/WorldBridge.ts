import { WorldSystem, WorldObject, InteractionEvent } from '../core/WorldSystem';
import { Profile, HandleError, ValidateCommand, LogSnapshot } from '@/core/boilerplate/decorators';
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

export class WorldBridge {
  private engine: WorldSystem;
  private state: WorldState;
  private stateUpdateCallback?: (state: WorldState) => void;

  constructor() {
    this.engine = new WorldSystem();
    this.state = {
      objects: [],
      interactionMode: 'view',
      showDebugInfo: false,
      events: []
    };
  }

  setStateUpdateCallback(callback: (state: WorldState) => void): void {
    this.stateUpdateCallback = callback;
  }

  @HandleError()
  @Profile()
  addObject(object: Omit<WorldObject, 'id'>): string {
    const id = this.generateId();
    const worldObject: WorldObject = { ...object, id };
    
    this.engine.addObject(worldObject);
    this.updateState();
    
    return id;
  }

  @HandleError()
  @Profile()
  removeObject(id: string): boolean {
    const success = this.engine.removeObject(id);
    if (success) {
      if (this.state.selectedObjectId === id) {
        delete this.state.selectedObjectId;
      }
      this.updateState();
    }
    return success;
  }

  @HandleError()
  @Profile()
  updateObject(id: string, updates: Partial<WorldObject>): boolean {
    const success = this.engine.updateObject(id, updates);
    if (success) {
      this.updateState();
    }
    return success;
  }

  @HandleError()
  selectObject(id?: string): void {
    if (id === undefined) {
      delete this.state.selectedObjectId;
    } else {
      this.state.selectedObjectId = id;
    }
    this.updateState();
  }

  @HandleError()
  setInteractionMode(mode: WorldState['interactionMode']): void {
    this.state.interactionMode = mode;
    this.updateState();
  }

  toggleDebugInfo(): void {
    this.state.showDebugInfo = !this.state.showDebugInfo;
    this.updateState();
  }

  @HandleError()
  interact(objectId: string, action: string): void {
    const object = this.engine.getObject(objectId);
    if (!object || !object.canInteract) return;

    const event: InteractionEvent = {
      type: 'custom' as const,
      object1Id: objectId,
      timestamp: Date.now(),
      data: { action }
    };

    this.engine.processInteraction(event);
    this.updateState();
  }

  @Profile()
  raycast(origin: THREE.Vector3, direction: THREE.Vector3): WorldObject | null {
    const result = this.engine.raycast(origin, direction);
    return result?.object || null;
  }

  @Profile()
  getObjectsInRadius(center: THREE.Vector3, radius: number): WorldObject[] {
    return this.engine.getObjectsInRadius(center, radius);
  }

  getObjectsByType(type: WorldObject['type']): WorldObject[] {
    return this.engine.getObjectsByType(type);
  }

  @LogSnapshot()
  getState(): WorldState {
    return { ...this.state };
  }

  @HandleError()
  cleanup(): void {
    this.engine.cleanup();
    this.state = {
      objects: [],
      interactionMode: 'view',
      showDebugInfo: false,
      events: []
    };
    this.updateState();
  }

  @Profile()
  private updateState(): void {
    this.state.objects = this.engine.getAllObjects();
    this.state.events = this.engine.getRecentEvents();
    
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback({ ...this.state });
    }
  }

  private generateId(): string {
    return `world_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
