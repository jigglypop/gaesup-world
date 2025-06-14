import { StateCreator } from 'zustand';
import * as THREE from 'three';

type Sizes = Record<string, THREE.Vector3>;

export interface SizesSlice {
  sizes: Sizes;
  setSizes: (update: (prev: Sizes) => Sizes) => void;
}

export const createSizesSlice: StateCreator<SizesSlice, [], [], SizesSlice> = (set) => ({
  sizes: {},
  setSizes: (update) =>
    set((state) => ({
      sizes: update(state.sizes),
    })),
});
