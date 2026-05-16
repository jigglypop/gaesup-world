import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { BaseComponent } from '../BaseComponent';
import { ComponentContext, IForceComponent } from '../types';
export interface GravityForceProperties {
    gravity?: number;
    maxFallSpeed?: number;
    enabled?: boolean;
}
export declare class GravityForceComponent extends BaseComponent implements IForceComponent {
    private gravity;
    private maxFallSpeed;
    private force;
    constructor(properties?: GravityForceProperties);
    protected onInitialize(): void;
    protected onUpdate(context: ComponentContext): void;
    protected onDispose(): void;
    getForce(): THREE.Vector3;
    applyForce(rigidBody: RapierRigidBody, deltaTime: number): void;
    setGravity(gravity: number): void;
    getGravity(): number;
}
