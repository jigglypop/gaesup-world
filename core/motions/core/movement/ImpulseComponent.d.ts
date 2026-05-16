import { RapierRigidBody } from '@react-three/rapier';
import { type InputAdapter } from '@/core/interactions/core';
import type { RefObject } from '@core/boilerplate';
import { PhysicsConfigType } from '@stores/slices';
import { PhysicsCalcProps, PhysicsState } from '../../types';
import { EntityStateManager } from '../system/EntityStateManager';
export declare class ImpulseComponent {
    private stateManager;
    private inputBackend;
    private config;
    private scratchImpulse;
    private scratchLinvel;
    private navigation;
    constructor(config: PhysicsConfigType, stateManager?: EntityStateManager, inputBackend?: InputAdapter);
    applyImpulse(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: PhysicsState, calcProp?: PhysicsCalcProps): void;
    private applyCharacterImpulse;
    private canMoveForward;
    private applyVehicleImpulse;
    private applyAirplaneImpulse;
    private getKeyboard;
}
