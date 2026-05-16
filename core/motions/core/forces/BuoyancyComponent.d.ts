import { RapierRigidBody } from '@react-three/rapier';
import type { PhysicsConfigType } from '@stores/slices';
import { ForceComponent } from './ForceComponent';
export declare class BuoyancyComponent extends ForceComponent {
    protected config: PhysicsConfigType;
    private waterLevel;
    constructor(config?: PhysicsConfigType, waterLevel?: number);
    setWaterLevel(waterLevel: number): void;
    update(rigidBody: RapierRigidBody, delta: number): void;
}
