import * as THREE from 'three';

const tempVector = new THREE.Vector3();
const tempAxis = new THREE.Vector3(0, 0, 1);
const vectorPool: THREE.Vector3[] = [];
const zeroVector = new THREE.Vector3(0, 0, 0);
const oneVector = new THREE.Vector3(1, 1, 1);

function getPooledVector(): THREE.Vector3 {
  return vectorPool.pop() || new THREE.Vector3();
}

function releaseVector(vector: THREE.Vector3): void {
  if (vectorPool.length < 50) {
    vector.set(0, 0, 0);
    vectorPool.push(vector);
  }
}

export function isVectorNonZero(v: THREE.Vector3): boolean {
  return v.x !== 0 && v.y !== 0 && v.z !== 0;
}

export function calcNorm(u: THREE.Vector3, v: THREE.Vector3, calcZ: boolean): number {
  const dx = u.x - v.x,
    dy = u.y - v.y,
    dz = u.z - v.z;
  return Math.sqrt(dx * dx + (calcZ ? dy * dy : 0) + dz * dz);
}

export const isValidOrZero = (condition: boolean, vector: THREE.Vector3): THREE.Vector3 =>
  condition ? vector : zeroVector;

export const isValidOrOne = (condition: boolean, vector: THREE.Vector3): THREE.Vector3 =>
  condition ? vector : oneVector;

export function calcAngleByVector(dir: THREE.Vector3): number {
  const dot = dir.dot(tempAxis) / dir.length();
  const angles = Math.acos(Math.max(-1, Math.min(1, dot)));
  tempVector.copy(dir).cross(tempAxis);
  const isLeft = Math.sin(tempVector.y) || 1;
  return Math.PI - angles * isLeft;
}

export const V3 = (x = 0, y = 0, z = 0) => {
  const v = getPooledVector();
  v.set(x, y, z);
  return v;
};
export const Qt = (x = 0, y = 0, z = 0, w = 1) => new THREE.Quaternion(x, y, z, w);
export const Elr = (x = 0, y = 0, z = 0) => new THREE.Euler(x, y, z);
export const V30 = () => getPooledVector();
export const V31 = () => V3(1, 1, 1);
export { getPooledVector, releaseVector };
