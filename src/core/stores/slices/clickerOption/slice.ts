import { StateCreator } from 'zustand';
import { ClickerOptionSlice, ClickerOptionState } from './types';

export const initialClickerOptionState: ClickerOptionState = {
  isRun: true,
  throttle: 100,
  autoStart: false,
  track: false,
  loop: false,
  queue: [],
  line: false,
};

export const createClickerOptionSlice: StateCreator<
  ClickerOptionSlice,
  [],
  [],
  ClickerOptionSlice
> = (set) => ({
  clickerOption: initialClickerOptionState,
  setClickerOption: (update) =>
    set((state) => ({
      clickerOption: { ...state.clickerOption, ...update },
    })),
});
