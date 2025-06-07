import * as THREE from 'three';
import { GLTFResult } from '../../component/type';

export type gltfAndSizeType = {
  size: THREE.Vector3;
  setSize: (size: THREE.Vector3, keyName?: string) => void;
  getSize: (keyName?: string) => THREE.Vector3 | null;
};

export type useGltfAndSizeType = {
  url: string;
};

export type GltfAndSizeReturnType = gltfAndSizeType & { gltf: GLTFResult };
