import { StateCreator } from 'zustand';
import { AnimationSlice } from './types';
import { EntityAnimationStates } from '../../../types/core';

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

export const createAnimationSlice: StateCreator<AnimationSlice, [], [], AnimationSlice> = (
  set,
  get,
) => ({
  animationState: initialAnimationState,
  setCurrentAnimation: (type, newCurrent) =>
    set((state) => ({
      animationState: {
        ...state.animationState,
        [type]: {
          ...state.animationState[type],
          current: newCurrent,
        },
      },
    })),
  setAnimationStore: (type, newStore) =>
    set((state) => ({
      animationState: {
        ...state.animationState,
        [type]: {
          ...state.animationState[type],
          store: newStore,
        },
      },
    })),
  getCurrentAnimation: (type) => {
    const animation = get().animationState[type];
    return animation.current;
  },
  getAnimationStore: (type) => {
    const animation = get().animationState[type];
    return animation.store;
  },
});
