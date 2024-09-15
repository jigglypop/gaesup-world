import * as THREE from "three";

export function isVectorNonZero(v: THREE.Vector3): boolean {
  return v.toArray().every((value) => value !== 0);
}

export function calcNorm(
  u: THREE.Vector3,
  v: THREE.Vector3,
  calcZ: boolean
): number {
  return Math.sqrt(
    Math.pow(u.x - v.x, 2) +
      (calcZ && Math.pow(u.y - v.y, 2)) +
      Math.pow(u.z - v.z, 2)
  );
}

export function isValidOrZero(
  condision: boolean,
  vector: THREE.Vector3
): THREE.Vector3 {
  return condision ? vector : new THREE.Vector3(0, 0, 0);
}

export function isValidOrOne(
  condision: boolean,
  vector: THREE.Vector3
): THREE.Vector3 {
  return condision ? vector : new THREE.Vector3(1, 1, 1);
}

export function V3(x?: number, y?: number, z?: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, z);
}

export function V30(): THREE.Vector3 {
  return new THREE.Vector3(0, 0, 0);
}

export function V31(): THREE.Vector3 {
  return new THREE.Vector3(1, 1, 1);
}

export function Qt(
  x?: number,
  y?: number,
  z?: number,
  w?: number
): THREE.Quaternion {
  return new THREE.Quaternion(x, y, z, w);
}

export function Elr(x: number, y: number, z: number): THREE.Euler {
  return new THREE.Euler(x, y, z);
}

export function calcAngleByVector(dir: THREE.Vector3): number {
  const axis = V3(0, 0, 1);
  const angles = Math.acos(dir.dot(axis) / dir.length());
  const product = dir.cross(axis);
  const isLeft = Math.sin(product.y) || 1;
  const angle = Math.PI - angles * isLeft;
  return angle;
}
