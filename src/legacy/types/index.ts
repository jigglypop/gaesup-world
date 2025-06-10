import * as THREE from "three";

export type nodesType = {
  [name: string]: THREE.Object3D<THREE.Object3DEventMap>;
};
