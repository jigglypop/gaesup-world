import * as THREE from 'three';
export interface UsePlayerPositionOptions {
    updateInterval?: number;
    entityId?: string;
}
export interface UsePlayerPositionResult {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    rotation: THREE.Euler;
    isMoving: boolean;
    isGrounded: boolean;
    speed: number;
    height: number;
}
export declare function usePlayerPosition(options?: UsePlayerPositionOptions): UsePlayerPositionResult;
export declare function usePlayerWorldPosition(options?: UsePlayerPositionOptions): THREE.Vector3;
