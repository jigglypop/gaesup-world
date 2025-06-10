import { MutableRefObject } from 'react';
import * as THREE from 'three';
import { PartsType } from '../types';

export type InnerGroupRefType = {
  children?: React.ReactNode;
  objectNode: THREE.Object3D;
  animationRef: MutableRefObject<THREE.Object3D<THREE.Object3DEventMap>>;
  nodes: {
    [name: string]: THREE.Object3D<THREE.Object3DEventMap>;
  };
  isActive?: boolean;
  ridingUrl?: string;
  offset?: THREE.Vector3;
  parts?: PartsType;
  isRiderOn?: boolean;
  enableRiding?: boolean;
};
