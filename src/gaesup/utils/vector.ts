import * as THREE from 'three';

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
