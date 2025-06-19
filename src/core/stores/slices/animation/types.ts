import * as THREE from 'three';
import { EntityAnimationStates } from '../../../types/core';

export interface AnimationSlice {
  animationState: EntityAnimationStates;
  setCurrentAnimation: (type: 'character' | 'vehicle' | 'airplane', newCurrent: string) => void;
  setAnimationStore: (
    type: 'character' | 'vehicle' | 'airplane',
    newStore: { [key: string]: AnimationPropType },
  ) => void;
  getCurrentAnimation: (type: 'character' | 'vehicle' | 'airplane') => string;
  getAnimationStore: (
    type: 'character' | 'vehicle' | 'airplane',
  ) => Record<string, AnimationPropType>;
}
export interface AnimationState {
  current: string;
  default: string;
  store: Record<string, THREE.AnimationAction>;
}

export type AnimationPropType = {
  current: string;
  animationNames: string;
  keyControl: {
    [key: string]: boolean;
  };
  store: Record<string, THREE.AnimationAction>;
  default: string;
  timestamp: number;
  data: Record<string, unknown>;
};
