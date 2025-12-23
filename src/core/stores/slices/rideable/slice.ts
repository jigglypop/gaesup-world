import { StateCreator } from 'zustand';

import { RideableSlice } from './types';

export const createRideableSlice: StateCreator<RideableSlice, [], [], RideableSlice> = (set) => ({
  rideable: {},
  setRideable: (key, object) =>
    set((state) => {
      const prev = state.rideable[key];
      const next = {
        ...(prev ?? { objectkey: key }),
        ...object,
        objectkey: key,
      };
      return {
        rideable: { ...state.rideable, [key]: next },
      };
    }),
  removeRideable: (key) =>
    set((state) => {
      const rest = { ...state.rideable };
      delete rest[key];
      return { rideable: rest };
    }),
});
