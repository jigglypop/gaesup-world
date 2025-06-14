import { StateCreator } from 'zustand';
import { ModeSlice } from './modeSlice';

// From atoms/types.ts
export interface AnimationState {
  character: {
    current: string;
    default: string;
    store: Record<string, any>;
  };
  vehicle: {
    current: string;
    default: string;
    store: Record<string, any>;
  };
  airplane: {
    current: string;
    default: string;
    store: Record<string, any>;
  };
}

// Slice Interface
export interface AnimationSlice {
  animation: AnimationState;
  setAnimation: (animation: Partial<AnimationState>) => void;
  currentAnimation: () => {
    current: string;
    default: string;
    store: Record<string, any>;
  };
}

export const createAnimationSlice: StateCreator<
  ModeSlice & AnimationSlice,
  [],
  [],
  AnimationSlice
> = (set, get) => ({
  animation: {
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
  setAnimation: (animation) =>
    set((state) => ({ animation: { ...state.animation, ...animation } })),
  currentAnimation: () => {
    const { mode, animation } = get();
    return animation[mode.type];
  },
});
