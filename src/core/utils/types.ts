import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

export interface ResourceUrls {
  characterUrl?: string;
  vehicleUrl?: string;
  airplaneUrl?: string;
  wheelUrl?: string;
  ridingUrl?: string;
}

export interface PerformanceConfig {
  mode?: 0 | 1 | 2;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  zIndex?: number;
  opacity?: number;
}

export interface VectorOperations {
  add: (a: THREE.Vector3, b: THREE.Vector3) => THREE.Vector3;
  subtract: (a: THREE.Vector3, b: THREE.Vector3) => THREE.Vector3;
  multiply: (a: THREE.Vector3, scalar: number) => THREE.Vector3;
  normalize: (v: THREE.Vector3) => THREE.Vector3;
  distance: (a: THREE.Vector3, b: THREE.Vector3) => number;
}

export interface MemoizationCache<T = unknown> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number;
}

export interface GLTFPreloadConfig {
  url: string;
  useCache?: boolean;
  timeout?: number;
}

export interface GLTFProcessingResult {
  gltf: GLTF;
  animations: THREE.AnimationClip[];
  scene: THREE.Group;
  nodes: Record<string, THREE.Object3D>;
  materials: Record<string, THREE.Material>;
}

export interface AnimationConfig {
  mixer: THREE.AnimationMixer;
  clips: THREE.AnimationClip[];
  actions: Record<string, THREE.AnimationAction>;
  defaultAnimation?: string;
  crossFadeDuration?: number;
}

export interface MotionConfig {
  speed: number;
  damping: number;
  threshold: number;
  smoothing: boolean;
}
