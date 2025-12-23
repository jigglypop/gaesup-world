import * as THREE from 'three';

import { WorldObject, InteractionEvent } from '../core/WorldSystem';

export type WorldCommand = 
  | AddObjectCommand
  | RemoveObjectCommand
  | UpdateObjectCommand
  | SelectObjectCommand
  | SetInteractionModeCommand
  | ToggleDebugInfoCommand
  | InteractCommand
  | CleanupCommand;

export interface AddObjectCommand {
  type: 'addObject';
  data: Omit<WorldObject, 'id'>;
}

export interface RemoveObjectCommand {
  type: 'removeObject';
  data: { id: string };
}

export interface UpdateObjectCommand {
  type: 'updateObject';
  data: { id: string; updates: Partial<WorldObject> };
}

export interface SelectObjectCommand {
  type: 'selectObject';
  data: { id?: string };
}

export interface SetInteractionModeCommand {
  type: 'setInteractionMode';
  data: { mode: 'view' | 'edit' | 'interact' };
}

export interface ToggleDebugInfoCommand {
  type: 'toggleDebugInfo';
}

export interface InteractCommand {
  type: 'interact';
  data: { objectId: string; action: string };
}

export interface CleanupCommand {
  type: 'cleanup';
}

// WorldBridge Snapshot
export interface WorldSnapshot {
  objects: WorldObject[];
  selectedObjectId?: string;
  interactionMode: 'view' | 'edit' | 'interact';
  showDebugInfo: boolean;
  events: InteractionEvent[];
  objectsInRadius?: (center: THREE.Vector3, radius: number) => WorldObject[];
  objectsByType?: (type: WorldObject['type']) => WorldObject[];
  raycast?: (origin: THREE.Vector3, direction: THREE.Vector3) => WorldObject | null;
}

export interface WorldBridgeState {
  selectedObjectId?: string;
  interactionMode: 'view' | 'edit' | 'interact';
  showDebugInfo: boolean;
}

export interface WorldBridgeMetrics {
  totalObjects: number;
  objectsByType: Record<string, number>;
  totalEvents: number;
  lastInteractionTime: number;
} 