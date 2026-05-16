import { RapierRigidBody } from '@react-three/rapier';
import type { RefObject } from '@core/boilerplate';
import { PhysicsConfigType } from '@stores/slices';
import type { PhysicsState } from '../../types';
export declare class GravityComponent {
    private config;
    constructor(config: PhysicsConfigType);
    applyGravity(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: PhysicsState): void;
    private applyCharacterGravity;
    private applyAirplaneGravity;
    private applyVehicleGravity;
}
