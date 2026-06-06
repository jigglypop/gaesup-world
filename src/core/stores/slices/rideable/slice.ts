import { StateCreator } from 'zustand';

import { RideableSlice } from './types';

function sameRideableValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const aEntries = Object.entries(a as Record<string, unknown>);
  const bRecord = b as Record<string, unknown>;
  if (aEntries.length !== Object.keys(bRecord).length) return false;
  return aEntries.every(([key, value]) => bRecord[key] === value);
}

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
      if (prev && sameRideableValue(prev, next)) {
        return state;
      }
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
