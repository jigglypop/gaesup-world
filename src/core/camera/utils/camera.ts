import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { ActiveStateType } from '../../motions/core/types';
import { getCameraCollisionIndex, invalidateCameraColliders } from '../core/CameraCollisionIndex';
import { CAMERA_CONSTANTS } from '../core/constants';
import { CameraOptionType, CameraBounds, CollisionCheckResult, Obstacle } from '../core/types';

const tempVector3 = new THREE.Vector3();
const tempVector3_2 = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const tempMatrix4 = new THREE.Matrix4();
const tempQuaternion2 = new THREE.Quaternion();
const collisionDirection = new THREE.Vector3();
const collisionRaycaster = new THREE.Raycaster();
const collisionIntersections: THREE.Intersection[] = [];
const collisionResultPosition = new THREE.Vector3();
const collisionObstacles: Obstacle[] = [];
const collisionObstaclePool: Obstacle[] = [];
const collisionResult: CollisionCheckResult = {
  safe: true,
  position: collisionResultPosition,
  obstacles: collisionObstacles,
};

// Scratch objects for activeStateUtils fallbacks (avoid per-frame allocations).
const fallbackPosition = new THREE.Vector3();
const fallbackEuler = new THREE.Euler();
const fallbackVelocity = new THREE.Vector3();
const fallbackOffset = new THREE.Vector3();
const fallbackToVec3 = new THREE.Vector3();

function isPlainMesh(mesh: THREE.Mesh): boolean {
  return !('isInstancedMesh' in mesh) && !('isSkinnedMesh' in mesh) && !('isBatchedMesh' in mesh);
}

function missesBoundingSphere(mesh: THREE.Mesh, boundingSphere: THREE.Sphere, distance: number): boolean {
  if (!isPlainMesh(mesh)) return false;
  const e = mesh.matrixWorld.elements;
  const center = boundingSphere.center;
  const origin = collisionRaycaster.ray.origin;
  const direction = collisionRaycaster.ray.direction;
  const dx = e[0] * center.x + e[4] * center.y + e[8] * center.z + e[12] - origin.x;
  const dy = e[1] * center.x + e[5] * center.y + e[9] * center.z + e[13] - origin.y;
  const dz = e[2] * center.x + e[6] * center.y + e[10] * center.z + e[14] - origin.z;
  let along = dx * direction.x + dy * direction.y + dz * direction.z;
  if (along < 0) along = 0;
  else if (along > distance) along = distance;
  const px = dx - direction.x * along;
  const py = dy - direction.y * along;
  const pz = dz - direction.z * along;
  let scaleSq = e[0] * e[0] + e[1] * e[1] + e[2] * e[2];
  const scaleY = e[4] * e[4] + e[5] * e[5] + e[6] * e[6];
  const scaleZ = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
  if (scaleY > scaleSq) scaleSq = scaleY;
  if (scaleZ > scaleSq) scaleSq = scaleZ;
  return px * px + py * py + pz * pz > boundingSphere.radius * boundingSphere.radius * scaleSq;
}

function pushObstacle(mesh: THREE.Mesh, hit: THREE.Intersection): void {
  const index = collisionObstacles.length;
  let obstacle = collisionObstaclePool[index];
  if (!obstacle) {
    obstacle = { object: mesh, distance: 0, point: new THREE.Vector3() };
    collisionObstaclePool[index] = obstacle;
  }
  obstacle.object = mesh;
  obstacle.distance = hit.distance;
  obstacle.point.copy(hit.point);
  collisionObstacles.push(obstacle);
}

function isObjectExcluded(object: THREE.Object3D, excludedObjects?: THREE.Object3D[]): boolean {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current.userData['intangible']) return true;
    for (let i = 0, len = excludedObjects?.length ?? 0; i < len; i++) {
      if (current === excludedObjects?.[i]) return true;
    }
    current = current.parent;
  }

  return false;
}

export const invalidateCollisionCache = invalidateCameraColliders;

export { CAMERA_CONSTANTS };

export const cameraUtils = {
  tempVectors: {
    temp1: new THREE.Vector3(),
    temp2: new THREE.Vector3(),
    temp3: new THREE.Vector3(),
  },

  clampValue: (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
  },

  smoothingToSpeed: (value: number | undefined, fallback: number = CAMERA_CONSTANTS.FRAME_RATE_LERP_SPEED): number => {
    if (value === undefined) return fallback;
    if (!Number.isFinite(value)) return fallback;
    if (value <= 0) return 0;
    if (value >= 1) return value;

    const clamped = cameraUtils.clampValue(value, 0.001, 0.999);
    return -Math.log(1 - clamped) * 60;
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
    const targetQuaternion = tempQuaternion
      .setFromRotationMatrix(tempMatrix4.lookAt(camera.position, target, camera.up))
      .normalize();

    // Avoid per-frame allocations: reuse scratch quaternion instead of clone().
    tempQuaternion2.copy(camera.quaternion).normalize();

    if (tempQuaternion2.dot(targetQuaternion) < 0) {
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
    positionSpeed: number,
    deltaTime: number,
    rotationSpeed: number = positionSpeed * 0.8,
  ): void => {
    cameraUtils.frameRateIndependentLerpVector3(camera.position, targetPosition, positionSpeed, deltaTime);
    cameraUtils.smoothLookAt(camera, targetLookAt, rotationSpeed, deltaTime);
  },

  improvedCollisionCheck: (
    from: THREE.Vector3,
    to: THREE.Vector3,
    scene: THREE.Scene,
    radius: number = 0.5,
    excludedObjects?: THREE.Object3D[],
  ): CollisionCheckResult => {
    collisionObstacles.length = 0;
    collisionResult.safe = true;
    collisionResultPosition.copy(to);
    collisionDirection.subVectors(to, from);
    const distance = collisionDirection.length();
    if (distance <= 0) return collisionResult;
    collisionDirection.multiplyScalar(1 / distance);
    collisionRaycaster.set(from, collisionDirection);
    collisionRaycaster.near = 0;
    collisionRaycaster.far = distance;

    const meshes = getCameraCollisionIndex(scene).getTargets();
    let nearestDistance = Infinity;
    for (let i = 0, len = meshes.length; i < len; i++) {
      const mesh = meshes[i];
      const boundingSphere = mesh?.geometry?.boundingSphere;
      if (!mesh || !boundingSphere) continue;
      if (missesBoundingSphere(mesh, boundingSphere, distance)) continue;
      if (isObjectExcluded(mesh, excludedObjects)) continue;
      collisionIntersections.length = 0;
      collisionRaycaster.intersectObject(mesh, false, collisionIntersections);
      const hit = collisionIntersections[0];
      if (!hit) continue;
      pushObstacle(mesh, hit);
      if (hit.distance < nearestDistance) nearestDistance = hit.distance;
    }
    collisionIntersections.length = 0;
    if (collisionObstacles.length === 0) return collisionResult;

    collisionResult.safe = false;
    collisionResultPosition
      .copy(from)
      .addScaledVector(collisionDirection, Math.max(0, nearestDistance - radius));
    return collisionResult;
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
    bounds?: CameraBounds,
  ): THREE.Vector3 => {
    void radius;
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

  updateFOV: (
    camera: THREE.PerspectiveCamera,
    targetFOV: number,
    speed?: number,
    deltaTime?: number,
  ): void => {
    if (!speed || speed <= 0) {
      if (Math.abs(targetFOV - camera.fov) < 1e-4) return;
      camera.fov = targetFOV;
      camera.updateProjectionMatrix();
      return;
    }

    const factor = deltaTime === undefined
      ? speed
      : 1 - Math.exp(-cameraUtils.smoothingToSpeed(speed) * deltaTime);
    const nextFov =
      factor >= 1
        ? targetFOV
        : THREE.MathUtils.lerp(camera.fov, targetFOV, factor);

    // Updating the projection matrix is relatively expensive; skip when unchanged.
    if (Math.abs(nextFov - camera.fov) < 1e-4) return;
    camera.fov = nextFov;
    camera.updateProjectionMatrix();
  },

  clampPosition: (position: THREE.Vector3, bounds?: CameraBounds): THREE.Vector3 => {
    if (bounds) {
      position.y = cameraUtils.clampValue(
        position.y,
        bounds.minY ?? -Infinity,
        bounds.maxY ?? Infinity,
      );
    }
    return position;
  },

  isPositionEqual: (a: THREE.Vector3, b: THREE.Vector3, threshold = 0.001): boolean => {
    return (
      Math.abs(a.x - b.x) < threshold &&
      Math.abs(a.y - b.y) < threshold &&
      Math.abs(a.z - b.z) < threshold
    );
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

  calculateSafeDistance: (
    cameraPosition: THREE.Vector3,
    targetPosition: THREE.Vector3,
    minDistance: number,
    maxDistance: number,
  ): number => {
    const currentDistance = cameraPosition.distanceTo(targetPosition);
    return THREE.MathUtils.clamp(currentDistance, minDistance, maxDistance);
  },

  isPositionValid: (position: THREE.Vector3, bounds?: CameraOptionType['bounds']): boolean => {
    if (!bounds) return true;
    return (
      position.y >= (bounds.minY ?? -Infinity) &&
      position.y <= (bounds.maxY ?? Infinity)
    );
  },
};

export const vectorUtils = {
  copyFromRapier: (target: THREE.Vector3, source: { x: number; y: number; z: number }) => {
    target.set(source.x, source.y, source.z);
    return target;
  },

  toThreeVector3: (source: { x: number; y: number; z: number }, out?: THREE.Vector3) => {
    const v = out ?? fallbackToVec3;
    return v.set(source.x, source.y, source.z);
  },

  updatePosition: (target: THREE.Vector3, rigidBody: RapierRigidBody) => {
    if (!rigidBody) return target;
    const translation = rigidBody.translation();
    return vectorUtils.copyFromRapier(target, translation);
  },
};

export const activeStateUtils = {
  getPosition: (activeState: ActiveStateType): THREE.Vector3 => {
    return activeState?.position ? activeState.position : fallbackPosition.set(0, 0, 0);
  },

  getEuler: (activeState: ActiveStateType): THREE.Euler => {
    return activeState?.euler ? activeState.euler : fallbackEuler.set(0, 0, 0);
  },

  getVelocity: (activeState: ActiveStateType): THREE.Vector3 => {
    return activeState?.velocity ? activeState.velocity : fallbackVelocity.set(0, 0, 0);
  },

  calculateCameraOffset: (
    position: THREE.Vector3,
    options: {
      xDistance?: number;
      yDistance?: number;
      zDistance?: number;
      euler?: THREE.Euler;
      mode?: 'thirdPerson' | 'chase' | 'fixed';
    },
    out?: THREE.Vector3,
  ): THREE.Vector3 => {
    void position;
    const { xDistance = 15, yDistance = 8, zDistance = 15, euler, mode = 'thirdPerson' } = options;
    const v = out ?? fallbackOffset;
    
    switch (mode) {
      case 'chase':
        if (euler) {
          // Normalize (sin(y), 1, cos(y)) => divide by sqrt(2).
          const invLen = 1 / Math.SQRT2;
          return v.set(
            -xDistance * Math.sin(euler.y) * invLen,
            yDistance * invLen,
            -zDistance * Math.cos(euler.y) * invLen,
          );
        }
        return v.set(-xDistance, yDistance, -zDistance);
        
      case 'thirdPerson':
      default:
        return v.set(-xDistance, yDistance, -zDistance);
    }
  },

  getCameraTarget: (
    activeState: ActiveStateType,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 => {
    const position = activeStateUtils.getPosition(activeState);
    return cameraOption.target || position;
  },
}; 
