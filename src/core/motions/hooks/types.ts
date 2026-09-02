import { RefObject } from 'react';

import type { useGLTF } from '@react-three/drei';
import type { ObjectMap } from '@react-three/fiber';
import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { PhysicsEntityProps } from '../entities/types';

export type ResourceUrlsType = Record<string, string | undefined>;

export type GltfAndSizeOptions = { url?: string };

type LoadedGltf = ReturnType<typeof useGLTF<string>>;
type LegacyCompatibleGltf = Omit<LoadedGltf, keyof ObjectMap>;

export type GltfAndSizeResult = {
  gltf: LegacyCompatibleGltf;
  size: THREE.Vector3;
  setSize: (newSize: THREE.Vector3, keyName?: string) => void;
  getSize: (keyName?: string) => THREE.Vector3 | null;
};

export type GaesupGltfUtils = {
  getSizesByUrls: (urls?: ResourceUrlsType) => Record<string, THREE.Vector3 | null>;
  preloadSizes: (urls: string[]) => void;
};

export interface UsePhysicsEntityProps
  extends Pick<
    PhysicsEntityProps,
    | 'onIntersectionEnter'
    | 'onIntersectionExit'
    | 'onCollisionEnter'
    | 'userData'
    | 'outerGroupRef'
    | 'innerGroupRef'
    | 'colliderRef'
    | 'groundRay'
    | 'onFrame'
    | 'onAnimate'
    | 'onReady'
  > {
  rigidBodyRef?: RefObject<RapierRigidBody | null>;
  actions: Record<string, THREE.AnimationAction | null>;
  name?: string;
  isActive?: boolean;
}
