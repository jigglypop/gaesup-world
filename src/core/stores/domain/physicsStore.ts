import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { PhysicsSlice, createPhysicsSlice } from '../slices/physics';

export type PhysicsStore = PhysicsSlice;

export const usePhysicsStore = create<PhysicsStore>()(
  devtools(
    createPhysicsSlice,
    { name: 'physics-store' }
  )
); 