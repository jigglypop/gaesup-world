import { MotionType } from '../core/MotionEngine';
import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
export interface MotionCommand {
    type: 'move' | 'jump' | 'stop' | 'turn' | 'setConfig' | 'reset';
    data?: {
        movement?: THREE.Vector3;
        direction?: number;
        force?: THREE.Vector3;
        config?: any;
    };
}
export interface MotionSnapshot {
    type: MotionType;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    rotation: THREE.Euler;
    isGrounded: boolean;
    isMoving: boolean;
    speed: number;
    metrics: {
        currentSpeed: number;
        averageSpeed: number;
        totalDistance: number;
        frameTime: number;
        isAccelerating: boolean;
    };
    config: {
        maxSpeed: number;
        acceleration: number;
        jumpForce: number;
    };
}
export declare class MotionBridge {
    private engines;
    private eventListeners;
    private rigidBodies;
    constructor();
    registerEntity(id: string, type: MotionType, rigidBody: RapierRigidBody): void;
    unregisterEntity(id: string): void;
    execute(entityId: string, command: MotionCommand): void;
    updateEntity(entityId: string, deltaTime: number): void;
    snapshot(entityId: string): MotionSnapshot | null;
    getAllSnapshots(): Map<string, MotionSnapshot>;
    subscribe(listener: (snapshot: MotionSnapshot) => void): () => void;
    private notifyListeners;
    getActiveEntities(): string[];
    dispose(): void;
}
