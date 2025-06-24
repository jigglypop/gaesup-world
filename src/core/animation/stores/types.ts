import * as THREE from 'three';
import { EntityAnimationStates, AnimationState } from '../core/types';
import { ModeType } from '../../stores/types';

export interface AnimationActions {
  setAnimation: (type: keyof EntityAnimationStates, animation: string) => void;
  playAnimation: (type: keyof EntityAnimationStates, animation: string) => void;
  stopAnimation: (type: keyof EntityAnimationStates) => void;
  resetAnimations: () => void;
}

export interface AnimationSlice {
  animationState: EntityAnimationStates;
  setAnimation: (type: keyof EntityAnimationStates, animation: string) => void;
  playAnimation: (type: keyof EntityAnimationStates, animation: string) => void;
  stopAnimation: (type: keyof EntityAnimationStates) => void;
  resetAnimations: () => void;
  setAnimationAction: (
    type: keyof EntityAnimationStates,
    animation: string,
    action: THREE.AnimationAction,
  ) => void;
  getAnimation: (type: keyof EntityAnimationStates) => AnimationState;
  getCurrentAnimation: (type: keyof EntityAnimationStates) => string;
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