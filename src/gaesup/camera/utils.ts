import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import { ActiveStateType, CameraOptionType } from '../../types';
import { CameraPropType } from './types';

const tempVector3 = new THREE.Vector3();
const tempVector3_2 = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();

export const cameraUtils = {
  tempVectors: {
    temp1: new THREE.Vector3(),
    temp2: new THREE.Vector3(),
    temp3: new THREE.Vector3(),
  },

  clampValue: (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
  },

  lerpSmooth: (current: number, target: number, factor: number): number => {
    return current + (target - current) * factor;
  },

  frameRateIndependentLerp: (
    current: number,
    target: number,
    speed: number,
    deltaTime: number,
  ): number => {
    const factor = 1 - Math.exp(-speed * deltaTime);
    return current + (target - current) * factor;
  },

  frameRateIndependentLerpVector3: (
    current: THREE.Vector3,
    target: THREE.Vector3,
    speed: number,
    deltaTime: number,
  ): void => {
    const factor = 1 - Math.exp(-speed * deltaTime);
    current.lerp(target, factor);
  },

  smoothLookAt: (
    camera: THREE.Camera,
    target: THREE.Vector3,
    speed: number,
    deltaTime: number,
  ): void => {
    tempVector3.subVectors(target, camera.position).normalize();
    const targetQuaternion = tempQuaternion
      .setFromRotationMatrix(new THREE.Matrix4().lookAt(camera.position, target, camera.up))
      .normalize();

    const currentQuaternion = camera.quaternion.clone().normalize();

    if (currentQuaternion.dot(targetQuaternion) < 0) {
      targetQuaternion.x *= -1;
      targetQuaternion.y *= -1;
      targetQuaternion.z *= -1;
      targetQuaternion.w *= -1;
    }

    const factor = 1 - Math.exp(-speed * deltaTime);
    camera.quaternion.slerp(targetQuaternion, factor).normalize();
  },

  preventCameraJitter: (
    camera: THREE.Camera,
    targetPosition: THREE.Vector3,
    targetLookAt: THREE.Vector3,
    speed: number,
    deltaTime: number,
  ): void => {
    cameraUtils.frameRateIndependentLerpVector3(camera.position, targetPosition, speed, deltaTime);
    cameraUtils.smoothLookAt(camera, targetLookAt, speed * 0.8, deltaTime);
  },

  distanceSquared: (a: THREE.Vector3, b: THREE.Vector3): number => {
    return tempVector3.subVectors(a, b).lengthSq();
  },

  safeNormalize: (vector: THREE.Vector3): THREE.Vector3 => {
    const length = vector.length();
    return length > 0 ? vector.divideScalar(length) : vector.set(0, 0, 0);
  },

  smoothDamp: (
    current: THREE.Vector3,
    target: THREE.Vector3,
    velocity: THREE.Vector3,
    smoothTime: number,
    deltaTime: number,
    maxSpeed?: number,
  ): void => {
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    tempVector3.subVectors(current, target);
    const maxChange = maxSpeed ? maxSpeed * smoothTime : Infinity;
    tempVector3.clampLength(0, maxChange);
    tempVector3_2.copy(velocity).addScaledVector(tempVector3, omega).multiplyScalar(deltaTime);
    velocity.copy(velocity).sub(tempVector3_2).multiplyScalar(exp);
    current.copy(target).add(tempVector3.add(tempVector3_2).multiplyScalar(exp));
  },

  calculateBounds: (
    center: THREE.Vector3,
    radius: number,
    bounds?: {
      minX?: number;
      maxX?: number;
      minY?: number;
      maxY?: number;
      minZ?: number;
      maxZ?: number;
    },
  ): THREE.Vector3 => {
    if (!bounds) return center;
    const x = bounds.minX !== undefined ? Math.max(bounds.minX, center.x) : center.x;
    const y = bounds.minY !== undefined ? Math.max(bounds.minY, center.y) : center.y;
    const z = bounds.minZ !== undefined ? Math.max(bounds.minZ, center.z) : center.z;
    const maxX = bounds.maxX !== undefined ? Math.min(bounds.maxX, x) : x;
    const maxY = bounds.maxY !== undefined ? Math.min(bounds.maxY, y) : y;
    const maxZ = bounds.maxZ !== undefined ? Math.min(bounds.maxZ, z) : z;
    return tempVector3.set(maxX, maxY, maxZ);
  },

  fastAtan2: (y: number, x: number): number => {
    if (x === 0) return y > 0 ? Math.PI / 2 : y < 0 ? -Math.PI / 2 : 0;
    if (x > 0) return Math.atan(y / x);
    return Math.atan(y / x) + (y >= 0 ? Math.PI : -Math.PI);
  },

  isPositionEqual: (a: THREE.Vector3, b: THREE.Vector3, threshold = 0.001): boolean => {
    return (
      Math.abs(a.x - b.x) < threshold &&
      Math.abs(a.y - b.y) < threshold &&
      Math.abs(a.z - b.z) < threshold
    );
  },

  updateFOV: (
    camera: THREE.PerspectiveCamera,
    targetFov: number,
    lerpSpeed: number,
    minFov = 10,
    maxFov = 120,
  ): void => {
    const clampedFov = cameraUtils.clampValue(targetFov, minFov, maxFov);
    camera.fov = THREE.MathUtils.lerp(camera.fov, clampedFov, lerpSpeed);
    camera.updateProjectionMatrix();
  },

  pool: {
    vectors: [] as THREE.Vector3[],
    getVector3: (): THREE.Vector3 => {
      return cameraUtils.pool.vectors.pop() || new THREE.Vector3();
    },
    releaseVector3: (vector: THREE.Vector3): void => {
      vector.set(0, 0, 0);
      cameraUtils.pool.vectors.push(vector);
    },
  },

  updateFOVLerp: (
    camera: THREE.PerspectiveCamera,
    targetFov: number,
    lerpSpeed: number = CAMERA_CONSTANTS.DEFAULT_FOV_LERP,
  ): void => {
    const clampedFov = cameraUtils.clampValue(
      targetFov,
      CAMERA_CONSTANTS.MIN_FOV,
      CAMERA_CONSTANTS.MAX_FOV,
    );
    camera.fov = THREE.MathUtils.lerp(camera.fov, clampedFov, lerpSpeed);
    camera.updateProjectionMatrix();
  },

  clampPosition: (
    position: THREE.Vector3,
    bounds?: {
      minX?: number;
      maxX?: number;
      minY?: number;
      maxY?: number;
      minZ?: number;
      maxZ?: number;
    },
  ): THREE.Vector3 => {
    if (!bounds) return position;

    const x = cameraUtils.clampValue(position.x, bounds.minX ?? -Infinity, bounds.maxX ?? Infinity);
    const y = cameraUtils.clampValue(position.y, bounds.minY ?? -Infinity, bounds.maxY ?? Infinity);
    const z = cameraUtils.clampValue(position.z, bounds.minZ ?? -Infinity, bounds.maxZ ?? Infinity);

    return tempVector3.set(x, y, z);
  },
};

export const CAMERA_CONSTANTS = {
  THROTTLE_MS: 16,
  POSITION_THRESHOLD: 0.001,
  TARGET_THRESHOLD: 0.001,
  DEFAULT_LERP_SPEED: 0.1,
  DEFAULT_FOV_LERP: 0.05,
  MIN_FOV: 10,
  MAX_FOV: 120,
  FRAME_RATE_LERP_SPEED: 8.0,
} as const;

export abstract class BaseCameraController {
  protected tempVector = new THREE.Vector3();

  abstract calculateTargetPosition(
    activeState: ActiveStateType,
    cameraOption: CameraOptionType,
  ): THREE.Vector3;

  update(prop: CameraPropType): void {
    const {
      state,
      worldContext: { activeState },
      cameraOption,
    } = prop;
    if (!state?.camera) return;

    if (!activeState) return;

    const targetPosition = this.calculateTargetPosition(activeState, cameraOption);
    const lerpSpeed = cameraOption.smoothing?.position ?? 0.1;

    state.camera.position.lerp(targetPosition, lerpSpeed);
    state.camera.lookAt(cameraOption.target || activeState.position);

    if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
      cameraUtils.updateFOVLerp(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
    }
  }
}

export const vectorUtils = {
  copyFromRapier: (target: THREE.Vector3, source: { x: number; y: number; z: number }) => {
    target.set(source.x, source.y, source.z);
    return target;
  },

  toThreeVector3: (source: { x: number; y: number; z: number }) => {
    return new THREE.Vector3(source.x, source.y, source.z);
  },

  updatePosition: (target: THREE.Vector3, rigidBody: RapierRigidBody) => {
    if (!rigidBody) return target;
    const translation = rigidBody.translation();
    return vectorUtils.copyFromRapier(target, translation);
  },
};
