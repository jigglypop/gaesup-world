import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import { CameraOptionType, CameraBounds, CollisionCheckResult } from '../core/types';
import { CAMERA_CONSTANTS } from '../core/constants';
export { CAMERA_CONSTANTS };
export declare const cameraUtils: {
    tempVectors: {
        temp1: THREE.Vector3;
        temp2: THREE.Vector3;
        temp3: THREE.Vector3;
    };
    clampValue: (value: number, min: number, max: number) => number;
    frameRateIndependentLerpVector3: (current: THREE.Vector3, target: THREE.Vector3, speed: number, deltaTime: number) => void;
    smoothLookAt: (camera: THREE.Camera, target: THREE.Vector3, speed: number, deltaTime: number) => void;
    preventCameraJitter: (camera: THREE.Camera, targetPosition: THREE.Vector3, targetLookAt: THREE.Vector3, speed: number, deltaTime: number) => void;
    improvedCollisionCheck: (from: THREE.Vector3, to: THREE.Vector3, scene: THREE.Scene, radius?: number) => CollisionCheckResult;
    distanceSquared: (a: THREE.Vector3, b: THREE.Vector3) => number;
    safeNormalize: (vector: THREE.Vector3) => THREE.Vector3;
    smoothDamp: (current: THREE.Vector3, target: THREE.Vector3, velocity: THREE.Vector3, smoothTime: number, deltaTime: number, maxSpeed?: number) => void;
    calculateBounds: (center: THREE.Vector3, radius: number, bounds?: CameraBounds) => THREE.Vector3;
    fastAtan2: (y: number, x: number) => number;
    updateFOV: (camera: THREE.PerspectiveCamera, targetFOV: number, speed?: number) => void;
    clampPosition: (position: THREE.Vector3, bounds?: CameraBounds) => THREE.Vector3;
    isPositionEqual: (a: THREE.Vector3, b: THREE.Vector3, threshold?: number) => boolean;
    pool: {
        vectors: THREE.Vector3[];
        getVector3: () => THREE.Vector3;
        releaseVector3: (vector: THREE.Vector3) => void;
    };
    calculateSafeDistance: (cameraPosition: THREE.Vector3, targetPosition: THREE.Vector3, minDistance: number, maxDistance: number) => number;
    isPositionValid: (position: THREE.Vector3, bounds?: CameraOptionType["bounds"]) => boolean;
};
export declare const vectorUtils: {
    copyFromRapier: (target: THREE.Vector3, source: {
        x: number;
        y: number;
        z: number;
    }) => THREE.Vector3;
    toThreeVector3: (source: {
        x: number;
        y: number;
        z: number;
    }) => THREE.Vector3;
    updatePosition: (target: THREE.Vector3, rigidBody: RapierRigidBody) => THREE.Vector3;
};
export declare const activeStateUtils: {
    getPosition: (activeState: any) => THREE.Vector3;
    getEuler: (activeState: any) => THREE.Euler;
    getVelocity: (activeState: any) => THREE.Vector3;
    calculateCameraOffset: (position: THREE.Vector3, options: {
        xDistance?: number;
        yDistance?: number;
        zDistance?: number;
        euler?: THREE.Euler;
        mode?: "thirdPerson" | "chase" | "fixed";
    }) => THREE.Vector3;
    getCameraTarget: (activeState: any, cameraOption: any) => THREE.Vector3;
};
