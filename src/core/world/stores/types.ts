import { WorldObject } from '@core/world/types';
import { InteractionEvent } from '@core/world/core/WorldEngine';

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
  removeObject: (objectId: string) => void;
  updateObject: (
    objectId: string,
    updates: Partial<Omit<WorldObject, 'id'>>
  ) => void;
  selectObject: (objectId?: string) => void;
  setInteractionMode: (mode: 'view' | 'edit' | 'interact') => void;
  toggleDebugInfo: () => void;
  addEvent: (event: InteractionEvent) => void;
  loadState: (state: Partial<WorldSliceState>) => void;
  saveState: () => Partial<WorldSliceState>;
  clearEvents: () => void;
  setError: (error?: string) => void;
}
