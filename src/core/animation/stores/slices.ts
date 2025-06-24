import { AnimationSlice } from './types';
import { EntityAnimationStates, AnimationState } from '../core/types';
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

export const createAnimationSlice = (set: any, get: any): AnimationSlice => ({
  animationState: initialAnimationState,

  setAnimation: (type: keyof EntityAnimationStates, animation: string) =>
    set((state: any) => ({
      animationState: {
        ...state.animationState,
        [type]: {
          ...state.animationState[type],
          current: animation,
        },
      },
    })),

  playAnimation: (type: keyof EntityAnimationStates, animation: string) =>
    set((state: any) => ({
      animationState: {
        ...state.animationState,
        [type]: {
          ...state.animationState[type],
          current: animation,
        },
      },
    })),

  stopAnimation: (type: keyof EntityAnimationStates) => {
    const animation = get().animationState[type];
    if (animation.store[animation.current]) {
      animation.store[animation.current].stop();
    }
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
    set((state: any) => ({
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

  getAnimation: (type: keyof EntityAnimationStates): AnimationState =>
    get().animationState[type],

  getCurrentAnimation: (type: keyof EntityAnimationStates): string =>
    get().animationState[type].current,
});