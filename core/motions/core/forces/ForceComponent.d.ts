import { RapierRigidBody } from '@react-three/rapier';
import type { PhysicsConfigType } from '@stores/slices';
export declare abstract class ForceComponent {
    protected abstract config: PhysicsConfigType;
    abstract update(rigidBody: RapierRigidBody, delta: number): void;
}
