import * as THREE from 'three';

export interface CameraOptionType {
  offset: THREE.Vector3;
  maxDistance: number;
  distance: number;
  xDistance: number;
  yDistance: number;
  zDistance: number;
  zoom: number;
  target: THREE.Vector3;
  position: THREE.Vector3;
  focus: boolean;
  enableCollision: boolean;
  collisionMargin: number;
  smoothing: {
    position: number;
    rotation: number;
    fov: number;
  };
  fov: number;
  minFov: number;
  maxFov: number;
  bounds: {
    minY: number;
    maxY: number;
  };
  modeSettings: {
    character?: {
      distance?: number;
      height?: number;
      angle?: number;
    };
    vehicle?: {
      distance?: number;
      height?: number;
      angle?: number;
    };
    airplane?: {
      distance?: number;
      height?: number;
      angle?: number;
    };
  };
}

export interface CameraOptionSlice {
  cameraOption: CameraOptionType;
  setCameraOption: (update: Partial<CameraOptionType>) => void;
}
 