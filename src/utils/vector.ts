import * as THREE from 'three';

class VectorPool {
  private static _instance: VectorPool;
  private _tempVec3: THREE.Vector3;
  private _tempVec3_2: THREE.Vector3;
  private _tempQuat: THREE.Quaternion;

  private constructor() {
    this._tempVec3 = new THREE.Vector3();
    this._tempVec3_2 = new THREE.Vector3();
    this._tempQuat = new THREE.Quaternion();
  }

  public static getInstance(): VectorPool {
    if (!VectorPool._instance) {
      VectorPool._instance = new VectorPool();
    }
    return VectorPool._instance;
  }

  public get tempVector(): THREE.Vector3 {
    return this._tempVec3;
  }

  public get tempVector2(): THREE.Vector3 {
    return this._tempVec3_2;
  }

  public get tempQuaternion(): THREE.Quaternion {
    return this._tempQuat;
  }
}

export function isVectorNonZero(v: THREE.Vector3): boolean {
  return v.x !== 0 || v.y !== 0 || v.z !== 0;
}

export function calcNorm(u: THREE.Vector3, v: THREE.Vector3, calcY: boolean): number {
  const dx = u.x - v.x;
  const dy = calcY ? u.y - v.y : 0;
  const dz = u.z - v.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function createVector(x = 0, y = 0, z = 0, preset?: 'zero' | 'one'): THREE.Vector3 {
  if (preset === 'zero') return new THREE.Vector3(0, 0, 0);
  if (preset === 'one') return new THREE.Vector3(1, 1, 1);
  return new THREE.Vector3(x, y, z);
}

export function isValidOrZero(condition: boolean, vector: THREE.Vector3): THREE.Vector3 {
  const pool = VectorPool.getInstance();
  return condition ? vector : pool.tempVector.set(0, 0, 0);
}

export function isValidOrOne(condition: boolean, vector: THREE.Vector3): THREE.Vector3 {
  const pool = VectorPool.getInstance();
  return condition ? vector : pool.tempVector2.set(1, 1, 1);
}

export function calcAngleByVector(dir: THREE.Vector3): number {
  const axis = createVector(0, 0, 1);
  const dirLength = dir.length();
  const dotProduct = dir.dot(axis);
  const angles = dirLength > 0 ? Math.acos(dotProduct / dirLength) : 0;
  dir.cross(axis);
  const isLeft = Math.sin(dir.y) || 1;
  return Math.PI - angles * isLeft;
}

export const V3 = createVector;
export const Qt = (x = 0, y = 0, z = 0, w = 1) => new THREE.Quaternion(x, y, z, w);
export const Elr = (x = 0, y = 0, z = 0) => new THREE.Euler(x, y, z);
export const V30 = () => createVector(0, 0, 0, 'zero');
export const V31 = () => createVector(0, 0, 0, 'one');

export const getTempVector = () => VectorPool.getInstance().tempVector;
export const getTempVector2 = () => VectorPool.getInstance().tempVector2;
export const getTempQuaternion = () => VectorPool.getInstance().tempQuaternion;
