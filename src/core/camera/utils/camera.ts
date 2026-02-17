import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { ActiveStateType } from '../../motions/core/types';
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
const collisionSafePosition = new THREE.Vector3();
const collisionResultPosition = new THREE.Vector3();

// Scratch objects for activeStateUtils fallbacks (avoid per-frame allocations).
const fallbackPosition = new THREE.Vector3();
const fallbackEuler = new THREE.Euler();
const fallbackVelocity = new THREE.Vector3();
const fallbackOffset = new THREE.Vector3();
const fallbackToVec3 = new THREE.Vector3();

// Cached collidable mesh list to avoid scene.traverse every frame.
let cachedCollisionMeshes: THREE.Mesh[] = [];
let cachedCollisionScene: THREE.Scene | null = null;
let cachedCollisionVersion = -1;

function getCollisionMeshes(scene: THREE.Scene): THREE.Mesh[] {
  // Rebuild every 60 frames (~1s at 60fps) or when scene reference changes.
  const version = (scene as unknown as { _frameId?: number })._frameId ?? 0;
  if (scene === cachedCollisionScene && version - cachedCollisionVersion < 60) {
    return cachedCollisionMeshes;
  }
  cachedCollisionScene = scene;
  cachedCollisionVersion = version;
  cachedCollisionMeshes = [];
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && !object.userData['intangible'] && object.geometry?.boundingSphere) {
      cachedCollisionMeshes.push(object);
    }
  });
  return cachedCollisionMeshes;
}

export function invalidateCollisionCache(): void {
  cachedCollisionVersion = -1;
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
    speed: number,
    deltaTime: number,
  ): void => {
    cameraUtils.frameRateIndependentLerpVector3(camera.position, targetPosition, speed, deltaTime);
    cameraUtils.smoothLookAt(camera, targetLookAt, speed * 0.8, deltaTime);
  },

  improvedCollisionCheck: (
    from: THREE.Vector3,
    to: THREE.Vector3,
    scene: THREE.Scene,
    radius: number = 0.5,
  ): CollisionCheckResult => {
    collisionDirection.subVectors(to, from);
    const distance = collisionDirection.length();
    if (distance <= 0) {
      return { safe: true, position: to, obstacles: [] };
    }
    collisionDirection.multiplyScalar(1 / distance);
    collisionRaycaster.set(from, collisionDirection);
    collisionRaycaster.near = 0;
    collisionRaycaster.far = distance;

    const obstacles: Obstacle[] = [];
    const meshes = getCollisionMeshes(scene);

    for (let i = 0, len = meshes.length; i < len; i++) {
      const mesh = meshes[i];
      collisionIntersections.length = 0;
      collisionRaycaster.intersectObject(mesh, false, collisionIntersections);
      const hit = collisionIntersections[0];
      if (hit) {
        obstacles.push({
          object: mesh,
          distance: hit.distance,
          point: hit.point,
        });
      }
    }

    if (obstacles.length === 0) {
      return { safe: true, position: to, obstacles: [] };
    }

    const nearestObstacle = obstacles.reduce((nearest, current) =>
      current.distance < nearest.distance ? current : nearest,
    );

    collisionSafePosition
      .copy(from)
      .addScaledVector(collisionDirection, Math.max(0, nearestObstacle.distance - radius));

    // Copy into a dedicated result scratch to avoid returning a shared vector.
    collisionResultPosition.copy(collisionSafePosition);
    return { safe: false, position: collisionResultPosition, obstacles };
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

  updateFOV: (camera: THREE.PerspectiveCamera, targetFOV: number, speed?: number): void => {
    const nextFov =
      speed && speed > 0
        ? THREE.MathUtils.lerp(camera.fov, targetFOV, speed)
        : targetFOV;

    // Updating the projection matrix is relatively expensive; skip when unchanged.
    if (Math.abs(nextFov - camera.fov) < 1e-4) return;
    camera.fov = nextFov;
    camera.updateProjectionMatrix();
  },

  clampPosition: (position: THREE.Vector3, bounds?: CameraBounds): THREE.Vector3 => {
    if (bounds) {
      position.y = cameraUtils.clampValue(
        position.y,
        bounds.minY || -Infinity,
        bounds.maxY || Infinity,
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