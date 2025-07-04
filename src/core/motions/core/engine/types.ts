import * as THREE from 'three';

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
export type MotionMetrics = {
    currentSpeed: number;
    averageSpeed: number;
    totalDistance: number;
    frameTime: number;
    physicsTime: number;
    lastPosition: THREE.Vector3;
    isAccelerating: boolean;
    groundContact: boolean;
};
export type MotionType = 'character' | 'vehicle' | 'airplane';
