import { StateCreator } from 'zustand';

import { SizesSlice } from './types';

export const createSizesSlice: StateCreator<SizesSlice, [], [], SizesSlice> = (set) => ({
  sizes: {},
  setSizes: (update) =>
    set((state) => ({
      sizes: update(state.sizes),
    })),
});
