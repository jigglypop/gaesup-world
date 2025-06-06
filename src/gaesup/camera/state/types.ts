import * as THREE from 'three';
import { BlendFunction } from '../blend/CameraBlendManager';

export interface CameraState {
  name: string;
  type: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  fov: number;
  target?: THREE.Vector3;
  config: Record<string, unknown>;
  priority: number;
  tags: string[];
}

export interface CameraTransition {
  from: string;
  to: string;
  condition: () => boolean;
  duration: number;
  blendFunction: BlendFunction;
}
