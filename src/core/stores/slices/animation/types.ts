import * as THREE from 'three';
import { EntityAnimationStates } from '../../../types/core';
import { ModeType } from '../../types';

export interface AnimationActions {
  [key: string]: {
    fadeOut: (duration: number) => any;
    reset: () => any;
    fadeIn: (duration: number) => any;
    play: () => any;
  } | null;
}

export interface AnimationSlice {
  animationState: EntityAnimationStates;
  setCurrentAnimation: (type: ModeType, newCurrent: string) => void;
  setAnimationStore: (
    type: ModeType,
    newStore: { [key: string]: AnimationPropType },
  ) => void;
  getCurrentAnimation: (type: ModeType) => string;
  getAnimationStore: (
    type: ModeType,
  ) => Record<string, AnimationActions>;
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
