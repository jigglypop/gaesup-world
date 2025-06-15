import { StateCreator } from 'zustand';
import { AnimationAtomType, AnimationStateType } from '../../types';

export interface AnimationSlice {
  animationState: AnimationStateType;
  setCurrentAnimation: (type: 'character' | 'vehicle' | 'airplane', newCurrent: string) => void;
  setAnimationStore: (
    type: 'character' | 'vehicle' | 'airplane',
    newStore: { [key: string]: AnimationAtomType },
  ) => void;
  getCurrentAnimation: (type: 'character' | 'vehicle' | 'airplane') => string;
  getAnimationStore: (
    type: 'character' | 'vehicle' | 'airplane',
  ) => Record<string, AnimationAtomType>;
}

export const createAnimationSlice: StateCreator<AnimationSlice, [], [], AnimationSlice> = (
  set,
  get,
) => ({
  animationState: {
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
  },
  setCurrentAnimation: (type, newCurrent) =>
    set((state) => ({
      animationState: {
        ...state.animationState,
        [type]: {
          ...state.animationState[type],
          current: newCurrent,
        },
      } as AnimationStateType,
    })),
  setAnimationStore: (type, newStore) =>
    set((state) => ({
      animationState: {
        ...state.animationState,
        [type]: {
          ...state.animationState[type],
          store: newStore,
        },
      } as AnimationStateType,
    })),
  getCurrentAnimation: (type) => {
    const anim = get().animationState[type];
    return anim ? anim.current : 'idle';
  },
  getAnimationStore: (type) => {
    const anim = get().animationState[type];
    return anim ? anim.store : {};
  },
});
