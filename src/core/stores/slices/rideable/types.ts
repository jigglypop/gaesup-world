import * as THREE from 'three';

export type RideableState = Record<string, THREE.Object3D>;

export interface RideableSlice {
  rideable: RideableState;
  setRideable: (key: string, object: THREE.Object3D) => void;
  removeRideable: (key: string) => void;
}
