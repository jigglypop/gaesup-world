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

export type AddObjectCommand = {
  type: 'addObject';
  // Allow callers to supply an id so state-layer APIs can return the real id.
  data: Omit<WorldObject, 'id'> & { id?: string };
};

export type RemoveObjectCommand = {
  type: 'removeObject';
  data: { id: string };
};

export type UpdateObjectCommand = {
  type: 'updateObject';
  data: { id: string; updates: Partial<WorldObject> };
};

export type SelectObjectCommand = {
  type: 'selectObject';
  data: { id?: string };
};

export type SetInteractionModeCommand = {
  type: 'setInteractionMode';
  data: { mode: 'view' | 'edit' | 'interact' };
};

export type ToggleDebugInfoCommand = {
  type: 'toggleDebugInfo';
};

export type InteractCommand = {
  type: 'interact';
  data: { objectId: string; action: string };
};

export type CleanupCommand = {
  type: 'cleanup';
};

// WorldBridge Snapshot
export type WorldSnapshot = {
  objects: WorldObject[];
  selectedObjectId?: string;
  interactionMode: 'view' | 'edit' | 'interact';
  showDebugInfo: boolean;
  events: InteractionEvent[];
  objectsInRadius?: (center: THREE.Vector3, radius: number) => WorldObject[];
  objectsByType?: (type: WorldObject['type']) => WorldObject[];
  raycast?: (origin: THREE.Vector3, direction: THREE.Vector3) => WorldObject | null;
};

export type WorldBridgeState = {
  selectedObjectId?: string;
  interactionMode: 'view' | 'edit' | 'interact';
  showDebugInfo: boolean;
};

export type WorldBridgeMetrics = {
  totalObjects: number;
  objectsByType: Record<string, number>;
  totalEvents: number;
  lastInteractionTime: number;
}; 