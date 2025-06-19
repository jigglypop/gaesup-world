import * as THREE from 'three';
import { ActiveStateType } from '../../../types/core';

export interface ActiveStateSlice {
  activeState: ActiveStateType | null;
  setActiveState: (state: Partial<ActiveStateType>) => void;
  updateActiveState: (update: Partial<ActiveStateType>) => void;
  resetActiveState: () => void;
}
