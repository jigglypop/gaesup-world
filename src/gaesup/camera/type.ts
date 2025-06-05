import * as THREE from 'three';
import { CameraOptionType, gaesupWorldContextType } from '../world/context/type';

export interface CameraPropType {
  state?: { camera?: THREE.Camera };
  worldContext: Partial<gaesupWorldContextType>;
  cameraOption: CameraOptionType;
}

export type cameraRayType = {
  origin: THREE.Vector3;
  hit: THREE.Raycaster;
  rayCast: THREE.Raycaster | null;
  length: number;
  dir: THREE.Vector3;
  position: THREE.Vector3;
  intersects: THREE.Intersection<THREE.Mesh>[];
  detected: THREE.Intersection<THREE.Mesh>[];
  intersectObjectMap: { [uuid: string]: THREE.Mesh };
};
