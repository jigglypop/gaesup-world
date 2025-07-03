import { PhysicsState, characterConfigType, airplaneConfigType } from '../types';
import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
type GravityPhysicsState = Pick<PhysicsState, 'modeType' | 'gameStates'> & {
    characterConfig: characterConfigType;
    airplaneConfig: airplaneConfigType;
};
export declare class GravityController {
    applyGravity(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: GravityPhysicsState): void;
    private applyCharacterGravity;
    private applyAirplaneGravity;
}
export {};
