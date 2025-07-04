import { StateCreator } from 'zustand';
import { PhysicsSlice, PhysicsConfigType } from './types';
import { Vector3 } from 'three';

const initialState: PhysicsConfigType = {
  // character
  walkSpeed: 10,
  runSpeed: 20,
  jumpSpeed: 15,
  jumpGravityScale: 1.5,
  normalGravityScale: 1.0,
  airDamping: 0.1,
  stopDamping: 2.0,

  // vehicle
  maxSpeed: 10,
  accelRatio: 2,
  brakeRatio: 5,
  // airplane
  gravityScale: 0.3,
  angleDelta: new Vector3(0.02, 0.02, 0.02),
  maxAngle: new Vector3(Math.PI / 6, Math.PI, Math.PI / 6),
  // common
  linearDamping: 0.9,
};

export const createPhysicsSlice: StateCreator<
  PhysicsSlice,
  [],
  [],
  PhysicsSlice
> = (set) => ({
  physics: initialState,
  setPhysics: (update) =>
    set((state) => ({
      physics: { ...state.physics, ...update },
    })),
  resetPhysics: () => set({ physics: initialState }),
});
