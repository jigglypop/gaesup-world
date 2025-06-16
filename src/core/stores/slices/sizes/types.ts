import * as THREE from 'three';

export type SizesType = Record<string, THREE.Vector3>;

export interface SizesSlice {
  sizes: SizesType;
  setSizes: (update: (prev: SizesType) => SizesType) => void;
}
