import * as THREE from 'three';

export interface CameraState {
  camera: THREE.Camera;
  activeState: any;
  cameraOption: CameraOption;
  deltaTime: number;
}

export interface CameraOption {
  xDistance?: number;
  yDistance?: number;
  zDistance?: number;
  fov?: number;
  mode?: string;
  smoothing?: {
    position?: number;
    rotation?: number;
    fov?: number;
  };
  bounds?: CameraBounds;
}

export interface CameraBounds {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  minZ?: number;
  maxZ?: number;
}

export interface CameraController {
  name: string;
  calculatePosition(state: CameraState): THREE.Vector3;
  calculateLookAt?(state: CameraState): THREE.Vector3;
  shouldLerp(): boolean;
}

export interface CameraEffectConfig {
  shake?: {
    intensity: number;
    duration: number;
    frequency: number;
  };
  zoom?: {
    targetFov: number;
    duration: number;
  };
} 