// camera/type.ts
import * as THREE from 'three';

export type cameraRayType = {
  origin: THREE.Vector3;
  hit: THREE.Raycaster;
  rayCast: THREE.Raycaster | null;
  length: number;
  dir: THREE.Vector3;
  position: THREE.Vector3;
  intersects: THREE.Intersection<THREE.Mesh>[];
  detected: THREE.Intersection<THREE.Mesh>[];
  intersectObjectMap: Map<string, THREE.Mesh>; // 객체를 Map으로 변경하여 검색 성능 개선
  lastRaycastTime: number; // 레이캐스트 빈도 제한을 위한 타임스탬프
  raycastInterval: number; // 레이캐스트 간격 (ms)
};
