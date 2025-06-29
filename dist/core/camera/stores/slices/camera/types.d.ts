import * as THREE from 'three';
import { CameraType } from '../../../core/types';
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
export interface CameraState {
    name: string;
    type: CameraType;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    fov: number;
    config: CameraConfig;
    priority: number;
    tags: string[];
}
export interface CameraTransition {
    from: string;
    to: string;
    duration: number;
    easing?: string;
    conditions?: CameraTransitionCondition[];
}
export interface CameraSlice {
    cameraStates: Map<string, CameraState>;
    cameraTransitions: CameraTransition[];
    currentCameraStateName: string;
    cameraStateHistory: string[];
    setCameraStates: (states: Map<string, CameraState>) => void;
    setCameraTransitions: (transitions: CameraTransition[]) => void;
    setCurrentCameraStateName: (name: string) => void;
    setCameraStateHistory: (history: string[]) => void;
    addCameraState: (name: string, state: CameraState) => void;
    updateCurrentCameraState: (newState: Partial<CameraState>) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    setZoom: (zoom: number) => void;
    setRotation: (rotation: THREE.Euler) => void;
}
