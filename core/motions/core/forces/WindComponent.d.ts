import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import type { PhysicsConfigType } from '@stores/slices';
import { ForceComponent } from './ForceComponent';
export declare class WindComponent extends ForceComponent {
    protected config: PhysicsConfigType;
    private direction;
    private strength;
    constructor(config?: PhysicsConfigType, direction?: THREE.Vector3 | [number, number, number], strength?: number);
    setWind(direction: THREE.Vector3 | [number, number, number], strength: number): void;
    update(rigidBody: RapierRigidBody, delta: number): void;
}
