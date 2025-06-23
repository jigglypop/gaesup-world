import { WorldObject, InteractionEvent } from '../core/WorldEngine';

export interface WorldSliceState {
  objects: WorldObject[];
  selectedObjectId?: string;
  interactionMode: 'view' | 'edit' | 'interact';
  showDebugInfo: boolean;
  events: InteractionEvent[];
  loading: boolean;
  error?: string;
}

export interface WorldSliceActions {
  addObject: (object: Omit<WorldObject, 'id'>) => string;
  removeObject: (id: string) => boolean;
  updateObject: (id: string, updates: Partial<WorldObject>) => boolean;
  selectObject: (id?: string) => void;
  setInteractionMode: (mode: WorldSliceState['interactionMode']) => void;
  toggleDebugInfo: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  clearEvents: () => void;
}

export type WorldSlice = WorldSliceState & WorldSliceActions;
