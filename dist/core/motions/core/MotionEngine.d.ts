import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
export interface MotionState {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    rotation: THREE.Euler;
    isGrounded: boolean;
    isMoving: boolean;
    speed: number;
    direction: THREE.Vector3;
    lastUpdate: number;
}
export interface MotionConfig {
    maxSpeed: number;
    acceleration: number;
    deceleration: number;
    turnSpeed: number;
    jumpForce: number;
    gravity: number;
    linearDamping: number;
    angularDamping: number;
}
export interface MotionMetrics {
    currentSpeed: number;
    averageSpeed: number;
    totalDistance: number;
    frameTime: number;
    physicsTime: number;
    lastPosition: THREE.Vector3;
    isAccelerating: boolean;
    groundContact: boolean;
}
export type MotionType = 'character' | 'vehicle' | 'airplane';
export declare class MotionEngine {
    private state;
    private config;
    private metrics;
    private type;
    constructor(type: MotionType, config?: Partial<MotionConfig>);
    updatePosition(position: THREE.Vector3): void;
    updateVelocity(velocity: THREE.Vector3): void;
    updateRotation(rotation: THREE.Euler): void;
    setGrounded(grounded: boolean): void;
    applyForce(force: THREE.Vector3, rigidBody: RapierRigidBody): void;
    calculateMovement(input: {
        forward: boolean;
        backward: boolean;
        leftward: boolean;
        rightward: boolean;
        shift: boolean;
        space: boolean;
    }, deltaTime: number): THREE.Vector3;
    calculateJump(): THREE.Vector3;
    update(deltaTime: number): void;
    private calculateSpeed;
    private updateMetrics;
    getState(): Readonly<MotionState>;
    getMetrics(): Readonly<MotionMetrics>;
    getConfig(): Readonly<MotionConfig>;
    updateConfig(newConfig: Partial<MotionConfig>): void;
    reset(): void;
    dispose(): void;
}
