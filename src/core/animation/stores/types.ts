import * as THREE from 'three';
import { EntityAnimationStates, AnimationState } from '../core/types';

export interface AnimationSlice {
  animationState: EntityAnimationStates;
  setAnimation: (type: keyof EntityAnimationStates, animation: string) => void;
  resetAnimations: () => void;
  setAnimationAction: (
    type: keyof EntityAnimationStates,
    animation: string,
    action: THREE.AnimationAction,
  ) => void;
  getAnimation: (type: keyof EntityAnimationStates) => AnimationState;
  getCurrentAnimation: (type: keyof EntityAnimationStates) => string;
}