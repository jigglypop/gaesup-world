import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { cameraMeshMayIntersect, sweepSphereMesh } from './sphereSweep';
import { ActiveStateType } from '../../motions/core/types';
import { getCameraCollisionIndex, invalidateCameraColliders } from '../core/CameraCollisionIndex';
import { CAMERA_CONSTANTS } from '../core/constants';
import { CameraOptionType, CameraBounds, CollisionCheckResult, Obstacle, type CameraCollisionTargets } from '../core/types';

const tempVector3 = new THREE.Vector3();
const tempVector3_2 = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const tempMatrix4 = new THREE.Matrix4();
const tempQuaternion2 = new THREE.Quaternion();
const collisionDirection = new THREE.Vector3();
const collisionRaycaster = new THREE.Raycaster();
const collisionIntersections: THREE.Intersection[] = [];
const collisionContact = new THREE.Vector3();

// Scratch objects for activeStateUtils fallbacks (avoid per-frame allocations).
const fallbackPosition = new THREE.Vector3();
const fallbackEuler = new THREE.Euler();
const fallbackVelocity = new THREE.Vector3();
const fallbackOffset = new THREE.Vector3();
const fallbackToVec3 = new THREE.Vector3();

// Reuse storage, but observe hierarchy changes on every query (including before rendering).
const uncachedCollisionMeshes: THREE.Mesh[] = [];
const noCollisionExclusions: THREE.Object3D[] = [];

const traversalStack: THREE.Object3D[] = [];

type CollisionCandidate = THREE.Object3D & { isMesh?: boolean; isLineSegments2?: boolean; geometry?: unknown };

function collectCollisionMeshes(
  scene: THREE.Scene,
  meshes: THREE.Mesh[] = [],
  excludedObjects?: THREE.Object3D[],
): THREE.Mesh[] {
  meshes.length = 0;
  const excluded = excludedObjects && excludedObjects.length > 0 ? excludedObjects : null;
  const stack = traversalStack;
  stack.length = 0;
  scene.updateWorldMatrix(true, false);
  stack.push(scene);
  // Iterative pre-order walk: parents refresh their world matrix before children, same order as recursion.
  while (stack.length > 0) {
    const object = stack.pop() as CollisionCandidate;
    // Exclusion is inherited: entire avatar/helper subtrees can be skipped.
    if (excludedObjects && (object.userData['intangible'] || (excluded !== null && excluded.includes(object)))) continue;
    object.updateWorldMatrix(false, false);
    if (object.isMesh === true && object.isLineSegments2 !== true
      && !object.userData['intangible'] && object.geometry) {
      meshes.push(object as THREE.Mesh);
    }
    const children = object.children;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child) stack.push(child);
    }
  }
  return meshes;
}

function isCollidableInScene(mesh: THREE.Mesh, scene: THREE.Scene, excludedObjects: THREE.Object3D[]): boolean {
  let object: THREE.Object3D | null = mesh;
  while (object) {
    if (object.userData['intangible'] || excludedObjects.includes(object)) return false;
    if (object === scene) return true;
    object = object.parent;
  }
  return false;
}

// Collider mode refreshes only the tagged meshes and their ancestor chains instead of the whole scene.
function collectColliderMeshes(
  scene: THREE.Scene,
  meshes: THREE.Mesh[],
  excludedObjects: THREE.Object3D[],
): THREE.Mesh[] | null {
  const colliders = getCameraCollisionIndex(scene).getColliders();
  if (colliders.length === 0) return null;
  meshes.length = 0;
  for (let i = 0, len = colliders.length; i < len; i++) {
    const mesh = colliders[i];
    if (!mesh || !isCollidableInScene(mesh, scene, excludedObjects)) continue;
    mesh.updateWorldMatrix(true, false);
    meshes.push(mesh);
  }
  return meshes;
}

function getCollisionMeshes(
  scene: THREE.Scene,
  excludedObjects: THREE.Object3D[] | undefined,
  targets: CameraCollisionTargets,
): THREE.Mesh[] {
  const excluded = excludedObjects ?? noCollisionExclusions;
  return (targets === 'colliders' ? collectColliderMeshes(scene, uncachedCollisionMeshes, excluded) : null)
    ?? collectCollisionMeshes(scene, uncachedCollisionMeshes, excluded);
}

export function invalidateCollisionCache(): void {
  uncachedCollisionMeshes.length = 0;
  invalidateCameraColliders();
}

function sweepCameraPath(
  from: THREE.Vector3,
  to: THREE.Vector3,
  scene: THREE.Scene,
  radius: number,
  excludedObjects: THREE.Object3D[] | undefined,
  out: THREE.Vector3,
  obstacles: Obstacle[] | null,
  targets: CameraCollisionTargets,
): boolean {
  collisionDirection.subVectors(to, from);
  const distance = collisionDirection.length();
  if (!Number.isFinite(distance) || !Number.isFinite(radius) || radius < 0) throw new RangeError('Camera sweep requires finite endpoints and a nonnegative radius');
  if (distance > 0) collisionDirection.multiplyScalar(1 / distance);
  else collisionDirection.set(0, 0, 1);
  collisionRaycaster.set(from, collisionDirection);
  collisionRaycaster.near = 0;
  collisionRaycaster.far = distance;

  let blocked = false;
  let safeDistance = distance;

  try {
    const meshes = getCollisionMeshes(scene, excludedObjects, targets);
    for (let i = 0, len = meshes.length; i < len; i++) {
      const mesh = meshes[i];
      if (!mesh) continue;
      if (!cameraMeshMayIntersect(mesh, collisionRaycaster.ray, radius, distance)) continue;
      if (mesh instanceof THREE.SkinnedMesh) {
        // SkinnedMesh updates its attached bind inverse in this override.
        mesh.updateMatrixWorld(true);
        for (const bone of mesh.skeleton.bones) bone.updateWorldMatrix(true, false);
      }
      // A swept sphere contains its center ray, so the ray narrow phase only runs for zero-radius probes.
      if (radius > 0) {
        const sweptDistance = sweepSphereMesh(mesh, collisionRaycaster.ray, radius, distance, collisionContact);
        if (!Number.isFinite(sweptDistance)) continue;
        blocked = true;
        safeDistance = Math.min(safeDistance, sweptDistance);
        obstacles?.push({ object: mesh, distance: from.distanceTo(collisionContact), point: collisionContact.clone() });
        continue;
      }
      collisionIntersections.length = 0;
      collisionRaycaster.intersectObject(mesh, false, collisionIntersections);
      const hit = collisionIntersections[0];
      if (hit) {
        blocked = true;
        safeDistance = Math.min(safeDistance, Math.max(0, hit.distance - radius));
        obstacles?.push({ object: mesh, distance: hit.distance, point: hit.point.clone() });
      }
    }
  } finally {
    uncachedCollisionMeshes.length = 0;
    collisionIntersections.length = 0;
  }

  if (blocked) out.copy(from).addScaledVector(collisionDirection, safeDistance);
  else out.copy(to);
  return blocked;
}

/** Frame hot path: writes the collision-safe camera position into `out` without collecting obstacles. */
export function resolveCollisionPosition(
  from: THREE.Vector3,
  to: THREE.Vector3,
  scene: THREE.Scene,
  radius: number,
  excludedObjects: THREE.Object3D[] | undefined,
  out: THREE.Vector3,
  targets: CameraCollisionTargets = 'scene',
): THREE.Vector3 {
  sweepCameraPath(from, to, scene, radius, excludedObjects, out, null, targets);
  return out;
}

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
    const obstacles: Obstacle[] = [];
    const position = new THREE.Vector3();
    const blocked = sweepCameraPath(from, to, scene, radius, excludedObjects, position, obstacles, 'scene');
    return { safe: !blocked, position, obstacles };
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
