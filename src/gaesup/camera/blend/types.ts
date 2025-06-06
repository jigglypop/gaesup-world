import * as THREE from 'three';

export interface CameraBlendState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  fov: number;
  target?: THREE.Vector3;
}

export interface ActiveBlend {
  from: CameraBlendState;
  to: CameraBlendState;
  duration: number;
  elapsed: number;
  blendFunction: BlendFunction;
  onComplete?: () => void;
  initialQuaternion: THREE.Quaternion;
  targetQuaternion: THREE.Quaternion;
}
