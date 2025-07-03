import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { PhysicsState, characterConfigType, vehicleConfigType, airplaneConfigType } from '../types';
type ImpulsePhysicsState = Pick<PhysicsState, 'modeType' | 'gameStates' | 'activeState' | 'keyboard'> & {
    characterConfig: characterConfigType;
    vehicleConfig: vehicleConfigType;
    airplaneConfig: airplaneConfigType;
};
export declare class ImpulseController {
    applyImpulse(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: ImpulsePhysicsState): void;
    private applyCharacterImpulse;
    private applyVehicleImpulse;
    private applyAirplaneImpulse;
}
export {};
