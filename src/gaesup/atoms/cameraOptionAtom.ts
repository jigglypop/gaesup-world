// src/gaesup/atoms/cameraOptionAtom.ts
import { atom } from 'jotai';
import * as THREE from 'three';

export interface CameraOption {
  offset: THREE.Vector3;
  zoom: number;
  maxDistance: number;
}

export const cameraOptionAtom = atom<CameraOption>({
  offset: new THREE.Vector3(-10, -10, -10),
  zoom: 1,
  maxDistance: -7,
});
