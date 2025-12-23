import * as THREE from 'three';
import { StateCreator } from 'zustand';

import { AnimationSlice } from './types';
import { EntityAnimationStates } from '../core/types';

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

type SliceState = { animationState: EntityAnimationStates };

export const createAnimationSlice: StateCreator<
  SliceState,
  [],
  [],
  Omit<AnimationSlice, 'getAnimation' | 'getCurrentAnimation'>
> = (set) => ({
  animationState: initialAnimationState,

  setAnimation: (type: keyof EntityAnimationStates, animation: string) => {
    set((state) => ({
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
    set((state) => ({
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