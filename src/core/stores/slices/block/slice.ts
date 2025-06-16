import { StateCreator } from 'zustand';
import { BlockSlice } from './types';

export const createBlockSlice: StateCreator<BlockSlice, [], [], BlockSlice> = (set) => ({
  block: {
    camera: false,
    control: false,
    animation: false,
    scroll: true,
  },
  setBlock: (update) =>
    set((state) => ({
      block: { ...state.block, ...update },
    })),
});
