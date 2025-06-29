import { PhysicsState } from '../types';
import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
export declare class GravityController {
    applyGravity(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: PhysicsState): void;
    private applyCharacterGravity;
    private applyAirplaneGravity;
}
