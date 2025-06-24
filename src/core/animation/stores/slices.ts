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

  setAnimation: (type: keyof EntityAnimationStates, animation: string) => {
    set((state: any) => ({
      animationState: {
        ...state.animationState,
        [type]: {
          ...state.animationState[type],
          current: animation,
        },
      },
    }));
  },

  playAnimation: (type: keyof EntityAnimationStates, animation: string) => {
    const state = get();
    const animationData = state.animationState[type];
    const targetAction = animationData.store[animation];
    
    if (targetAction) {
      const currentAction = animationData.store[animationData.current];
      if (currentAction && currentAction !== targetAction) {
        currentAction.fadeOut(0.3);
      }
      targetAction.reset().fadeIn(0.3).play();
    }
    
    set((state: any) => ({
      animationState: {
        ...state.animationState,
        [type]: {
          ...state.animationState[type],
          current: animation,
        },
      },
    }));
  },

  stopAnimation: (type: keyof EntityAnimationStates) => {
    const state = get();
    const animation = state.animationState[type];
    if (animation.store[animation.current]) {
      animation.store[animation.current].stop();
    }
    
    set((state: any) => ({
      animationState: {
        ...state.animationState,
        [type]: {
          ...state.animationState[type],
          current: 'idle',
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