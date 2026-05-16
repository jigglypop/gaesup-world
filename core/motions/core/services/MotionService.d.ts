import * as THREE from 'three';
import { GameStatesType } from '@/core/world/components/Rideable/types';
export declare class MotionService {
    private readonly DEFAULT_JUMP_FORCE;
    private readonly DEFAULT_MAX_SPEED;
    private readonly DEFAULT_ACCELERATION;
    private readonly GROUND_THRESHOLD;
    calculateMovementForce(movement: THREE.Vector3, currentVelocity: THREE.Vector3, config: {
        maxSpeed: number;
        acceleration: number;
    }, out?: THREE.Vector3): THREE.Vector3;
    calculateJumpForce(isGrounded: boolean, jumpSpeed?: number, gameStates?: GameStatesType, out?: THREE.Vector3): THREE.Vector3;
    calculateGroundState(position: THREE.Vector3, velocity: THREE.Vector3): boolean;
    calculateSpeed(velocity: THREE.Vector3): number;
    calculateDirection(from: THREE.Vector3, to: THREE.Vector3, out?: THREE.Vector3): THREE.Vector3;
    applyDamping(velocity: THREE.Vector3, damping?: number, out?: THREE.Vector3): THREE.Vector3;
    limitVelocity(velocity: THREE.Vector3, maxSpeed: number): THREE.Vector3;
    calculateRotationToTarget(currentPosition: THREE.Vector3, targetPosition: THREE.Vector3): number;
    smoothRotation(currentRotation: number, targetRotation: number, smoothing?: number): number;
    calculateMetrics(velocity: THREE.Vector3, previousVelocity: THREE.Vector3, deltaTime: number, totalDistance: number): {
        currentSpeed: number;
        averageSpeed: number;
        totalDistance: number;
        frameTime: number;
        isAccelerating: boolean;
    };
    getDefaultConfig(): {
        maxSpeed: number;
        acceleration: number;
        jumpForce: number;
    };
}
