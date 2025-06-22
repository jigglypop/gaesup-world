import * as THREE from 'three';
import { ActiveStateType } from '../../types';
import { CameraOptionType } from '../../types/camera';

export interface CameraSystemState {
  config: CameraConfig;
  activeController?: ICameraController;
}

export interface CameraConfig {
  mode: string;
  distance: {
    x: number;
    y: number;
    z: number;
  };
  bounds?: CameraBounds;
  enableCollision: boolean;
  smoothing?: {
    position: number;
    rotation: number;
    fov: number;
  };
  fov?: number;
  zoom?: number;
  xDistance?: number;
  yDistance?: number;
  zDistance?: number;
  fixedPosition?: THREE.Vector3;
  fixedLookAt?: THREE.Vector3;
}

export interface CameraBounds {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  minZ?: number;
  maxZ?: number;
}

export interface CameraCalcProps {
  camera: THREE.Camera;
  scene: THREE.Scene;
  deltaTime: number;
  activeState: ActiveStateType;
  clock: THREE.Clock;
  excludeObjects?: THREE.Object3D[];
}



export interface ICameraController {
  name: string;
  defaultConfig: Partial<CameraConfig>;
  update(props: CameraCalcProps, state: CameraSystemState): void;
}

 