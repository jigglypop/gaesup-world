import * as THREE from 'three';
import { Ray } from '@dimforge/rapier3d-compat';
import { RapierRigidBody } from '@react-three/rapier';

/**
 * 기본 레이 타입
 */
export type RayType = {
  origin: THREE.Vector3;
  hit: any | null;
  rayCast: Ray | null;
  dir: THREE.Vector3;
  offset: THREE.Vector3;
  length: number;
  current?: THREE.Vector3;
  angle?: number;
  parent?: RapierRigidBody | null | undefined;
};

/**
 * 지면 감지용 레이
 */
export type GroundRayType = Omit<RayType, 'current' | 'angle'>;

/**
 * 카메라 충돌 감지용 레이
 */
export type CameraRayType = {
  origin: THREE.Vector3;
  dir: THREE.Vector3;
  position: THREE.Vector3;
  length: number;
  hit: THREE.Raycaster;
  rayCast: THREE.Raycaster | null;
  intersects: THREE.Intersection<THREE.Object3D>[];
  detected: THREE.Intersection<THREE.Object3D>[];
  intersectObjectMap: Map<string, THREE.Mesh>;
  lastRaycastTime: number;
  raycastInterval: number;
  lastPosition?: THREE.Vector3; // 이전 프레임의 카메라 위치 저장
  targetObjects?: THREE.Object3D[]; // 충돌 감지 대상 객체들
  threshold?: number; // 위치 변화 감지 임계값
};
