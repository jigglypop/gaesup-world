import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { PhysicsState } from '../types';
export declare class ImpulseController {
    applyImpulse(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: PhysicsState): void;
    private applyCharacterImpulse;
    private applyVehicleImpulse;
    private applyAirplaneImpulse;
}
