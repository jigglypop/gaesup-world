import { StateCreator } from 'zustand';

export interface BlockState {
  camera: boolean;
  control: boolean;
  animation: boolean;
  scroll: boolean;
}

export interface BlockSlice {
  block: BlockState;
  setBlock: (update: Partial<BlockState>) => void;
}

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
