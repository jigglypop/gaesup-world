import { Vector3 } from 'three';
import { StateCreator } from 'zustand';

import type { PhysicsConfigType, PhysicsSlice } from './types';

const createInitialPhysicsState = (): PhysicsConfigType => ({
    // character
    walkSpeed: 10,
    runSpeed: 20,
    jumpSpeed: 15,
    jumpGravityScale: 2.4,
    normalGravityScale: 1.0,
    airDamping: 0.1,
    stopDamping: 2.0,
    turnSpeed: undefined,

    // vehicle
    maxSpeed: 10,
    accelRatio: 2,
    brakeRatio: 5,
    wheelOffset: undefined,
    // airplane
    gravityScale: 0.3,
    angleDelta: new Vector3(0.02, 0.02, 0.02),
    maxAngle: new Vector3(Math.PI / 6, Math.PI, Math.PI / 6),
    // common
    buoyancy: undefined,
    linearDamping: 0.9,
    navigationAgentRadius: undefined,
});

export const createPhysicsSlice: StateCreator<
    PhysicsSlice,
    [],
    [],
    PhysicsSlice
> = (set) => ({
    physics: createInitialPhysicsState(),
    setPhysics: (update) =>
        set((state) => ({
            physics: { ...state.physics, ...update },
        })),
    resetPhysics: () => set({ physics: createInitialPhysicsState() }),
});
