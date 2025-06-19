import { StateCreator } from 'zustand';
import { RideableSlice } from './types';

export const createRideableSlice: StateCreator<RideableSlice, [], [], RideableSlice> = (set) => ({
  rideable: {},
  setRideable: (key, object) =>
    set((state) => ({
      rideable: { ...state.rideable, [key]: object },
    })),
  removeRideable: (key) =>
    set((state) => {
      const { [key]: removed, ...rest } = state.rideable;
      return { rideable: rest };
    }),
});
