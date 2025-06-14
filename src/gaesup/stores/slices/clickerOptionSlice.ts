import { StateCreator } from 'zustand';

// From types.ts
export interface ClickerOptionState {
  isRun: boolean;
  throttle: number;
  autoStart: boolean;
  track: boolean;
  loop: boolean;
  queue: Array<any>; // Replace 'any' with a more specific type if available
  line: boolean;
}

// Slice Interface
export interface ClickerOptionSlice {
  clickerOption: ClickerOptionState;
  setClickerOption: (update: Partial<ClickerOptionState>) => void;
}

export const createClickerOptionSlice: StateCreator<
  ClickerOptionSlice,
  [],
  [],
  ClickerOptionSlice
> = (set) => ({
  clickerOption: {
    isRun: true,
    throttle: 100,
    autoStart: false,
    track: false,
    loop: false,
    queue: [],
    line: false,
  },
  setClickerOption: (update) =>
    set((state) => ({
      clickerOption: { ...state.clickerOption, ...update },
    })),
});
