import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { PhysicsState, characterConfigType, vehicleConfigType, airplaneConfigType } from '../types';
type ImpulsePhysicsState = Pick<PhysicsState, 'modeType' | 'gameStates' | 'activeState'> & {
    characterConfig: characterConfigType;
    vehicleConfig: vehicleConfigType;
    airplaneConfig: airplaneConfigType;
};
export declare class ImpulseController {
    private readonly EPSILON;
    private readonly EPSILON_VERTICAL;
    private readonly BRAKE_THRESHOLD;
    private stateEngine;
    private interactionEngine;
    constructor();
    applyImpulse(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: ImpulsePhysicsState): void;
    private applyCharacterImpulse;
    private applyVehicleImpulse;
    private applyAirplaneImpulse;
}
export {};
