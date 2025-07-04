import * as THREE from 'three';
export interface CameraConfig {
    shoulderOffset?: THREE.Vector3;
    distance?: number;
    height?: number;
    lockTarget?: boolean;
    followSpeed?: number;
    rotationSpeed?: number;
    constraints?: {
        minDistance?: number;
        maxDistance?: number;
        minAngle?: number;
        maxAngle?: number;
    };
}
export interface CameraTransitionCondition {
    type: 'timer' | 'event' | 'distance' | 'custom';
    value?: number | string;
    target?: string;
    callback?: () => boolean;
}
export interface CameraTransition {
    from: string;
    to: string;
    duration: number;
    easing?: string;
    conditions?: CameraTransitionCondition[];
}
export interface CameraSlice {
    cameraTransitions: CameraTransition[];
    setCameraTransitions: (transitions: CameraTransition[]) => void;
}
