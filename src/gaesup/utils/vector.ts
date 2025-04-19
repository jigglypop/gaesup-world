import * as THREE from 'three';

// 공유 벡터 객체들 - 임시 계산용으로 재사용 (성능 최적화)
const _tempVec3 = new THREE.Vector3();
const _tempVec3_2 = new THREE.Vector3();
const _tempQuat = new THREE.Quaternion();

/**
 * 벡터가 모든 성분이 0이 아닌지 확인
 */
export function isVectorNonZero(v: THREE.Vector3): boolean {
  return v.x !== 0 || v.y !== 0 || v.z !== 0;
}

/**
 * 두 벡터 간의 거리 계산 (최적화 버전)
 */
export function calcNorm(u: THREE.Vector3, v: THREE.Vector3, calcY: boolean): number {
  const dx = u.x - v.x;
  const dy = calcY ? u.y - v.y : 0;
  const dz = u.z - v.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * 조건에 따라 벡터 또는 영벡터 반환 (메모리 할당 최적화)
 */
export function isValidOrZero(condition: boolean, vector: THREE.Vector3): THREE.Vector3 {
  return condition ? vector : _tempVec3.set(0, 0, 0);
}

/**
 * 조건에 따라 벡터 또는 단위벡터 반환 (메모리 할당 최적화)
 */
export function isValidOrOne(condition: boolean, vector: THREE.Vector3): THREE.Vector3 {
  return condition ? vector : _tempVec3_2.set(1, 1, 1);
}

/**
 * 벡터로부터 각도 계산 (성능 최적화)
 */
export function calcAngleByVector(dir: THREE.Vector3): number {
  // Z축 기준 방향 벡터
  const axis = V3(0, 0, 1);
  // 벡터 길이 미리 계산하여 재사용
  const dirLength = dir.length();
  // dot 연산
  const dotProduct = dir.dot(axis);
  // 각도 계산
  const angles = dirLength > 0 ? Math.acos(dotProduct / dirLength) : 0;
  // cross product 계산
  dir.cross(axis);
  const isLeft = Math.sin(dir.y) || 1;
  return Math.PI - angles * isLeft;
}

// 기존 축약형 함수들
export const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const Qt = (x = 0, y = 0, z = 0, w = 1) => new THREE.Quaternion(x, y, z, w);
export const Elr = (x = 0, y = 0, z = 0) => new THREE.Euler(x, y, z);
export const V30 = () => new THREE.Vector3();
export const V31 = () => new THREE.Vector3(1, 1, 1);

/**
 * 재사용 벡터 객체를 반환하는 유틸리티 함수
 * 임시 계산에만 사용하고 계산 결과는 새 객체에 복사해야 함
 */
export const getTempVector = () => _tempVec3;
export const getTempVector2 = () => _tempVec3_2;
export const getTempQuaternion = () => _tempQuat;
