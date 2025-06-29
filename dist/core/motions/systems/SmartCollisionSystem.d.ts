import * as THREE from 'three';
import { CameraCollisionConfig } from '../../camera/core/types';
export declare class SmartCollisionSystem {
    private raycaster;
    private config;
    private rayDirections;
    private debugLines;
    private debugMode;
    private tempVector1;
    private tempVector2;
    private tempVector3;
    private tempQuaternion;
    private tempDirection;
    constructor(config?: Partial<CameraCollisionConfig>);
    private initializeRayDirections;
    checkCollision(from: THREE.Vector3, to: THREE.Vector3, scene: THREE.Scene, excludeObjects?: THREE.Object3D[]): THREE.Vector3;
    private findBestCameraPosition;
    private calculateWallSlide;
    private isPositionClear;
    setDebugMode(enabled: boolean, scene?: THREE.Scene): void;
    updateDebugVisualization(from: THREE.Vector3, to: THREE.Vector3, scene: THREE.Scene): void;
}
