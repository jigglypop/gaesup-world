import * as THREE from 'three';

const tempVector = new THREE.Vector3();
const tempAxis = new THREE.Vector3(0, 0, 1);

export function isVectorNonZero(v: THREE.Vector3): boolean {
  return v.x !== 0 && v.y !== 0 && v.z !== 0;
}

export function calcNorm(u: THREE.Vector3, v: THREE.Vector3, calcZ: boolean): number {
  return Math.sqrt(
    Math.pow(u.x - v.x, 2) + (calcZ && Math.pow(u.y - v.y, 2)) + Math.pow(u.z - v.z, 2),
  );
}

export function isValidOrZero(condision: boolean, vector: THREE.Vector3): THREE.Vector3 {
  return condision ? vector : new THREE.Vector3(0, 0, 0);
}

export function isValidOrOne(condision: boolean, vector: THREE.Vector3): THREE.Vector3 {
  return condision ? vector : new THREE.Vector3(1, 1, 1);
}

export function calcAngleByVector(dir: THREE.Vector3): number {
  const angles = Math.acos(dir.dot(tempAxis) / dir.length());
  tempVector.copy(dir).cross(tempAxis);
  const isLeft = Math.sin(tempVector.y) || 1;
  const angle = Math.PI - angles * isLeft;
  return angle;
}

export const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const Qt = (x = 0, y = 0, z = 0, w = 1) => new THREE.Quaternion(x, y, z, w);
export const Elr = (x = 0, y = 0, z = 0) => new THREE.Euler(x, y, z);
export const V30 = () => new THREE.Vector3();
export const V31 = () => new THREE.Vector3(1, 1, 1);
