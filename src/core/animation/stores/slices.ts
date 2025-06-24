import { AnimationSlice } from './types';
import { EntityAnimationStates } from '../core/types';
import * as THREE from 'three';

const initialAnimationState: EntityAnimationStates = {
  character: {
    current: 'idle',
    default: 'idle',
    store: {},
  },
  vehicle: {
    current: 'idle',
    default: 'idle',
    store: {},
  },
  airplane: {
    current: 'idle',
    default: 'idle',
    store: {},
  },
};

export const createAnimationSlice = (set: any, get: any): Omit<AnimationSlice, 'getAnimation' | 'getCurrentAnimation'> => ({
  animationState: initialAnimationState,

  setAnimation: (type: keyof EntityAnimationStates, animation: string) => {
    set((state: { animationState: EntityAnimationStates }) => ({
      animationState: {
        ...state.animationState,
        [type]: {
          ...state.animationState[type],
          current: animation,
        },
      },
    }));
  },

  resetAnimations: () =>
    set(() => ({
      animationState: initialAnimationState,
    })),

  setAnimationAction: (
    type: keyof EntityAnimationStates,
    animation: string,
    action: THREE.AnimationAction,
  ) =>
    set((state: { animationState: EntityAnimationStates }) => ({
      animationState: {
        ...state.animationState,
        [type]: {
          ...state.animationState[type],
          store: {
            ...state.animationState[type].store,
            [animation]: action,
          },
        },
      },
    })),
});