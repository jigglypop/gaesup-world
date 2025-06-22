import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import { CameraOptionType, CameraBounds, CollisionCheckResult, Obstacle } from '../camera/core/types';
import { CAMERA_CONSTANTS } from '../constants';

const tempVector3 = new THREE.Vector3();
const tempVector3_2 = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();

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

  improvedCollisionCheck: (
    from: THREE.Vector3,
    to: THREE.Vector3,
    scene: THREE.Scene,
    radius: number = 0.5,
  ): CollisionCheckResult => {
    const direction = new THREE.Vector3().subVectors(to, from).normalize();
    const distance = from.distanceTo(to);
    const raycaster = new THREE.Raycaster(from, direction, 0, distance);

    const obstacles: Obstacle[] = [];

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      if (object.userData['intangible']) return;
      if (!object.geometry?.boundingSphere) return;

      const intersects = raycaster.intersectObject(object, false);
      if (intersects.length > 0) {
        obstacles.push({
          object,
          distance: intersects[0].distance,
          point: intersects[0].point,
        });
      }
    });

    if (obstacles.length === 0) {
      return { safe: true, position: to, obstacles: [] };
    }

    const nearestObstacle = obstacles.reduce((nearest, current) =>
      current.distance < nearest.distance ? current : nearest,
    );

    const safePosition = from
      .clone()
      .add(direction.multiplyScalar(Math.max(0, nearestObstacle.distance - radius)));

    return { safe: false, position: safePosition, obstacles };
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
    if (speed && speed > 0) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, speed);
    } else {
      camera.fov = targetFOV;
    }
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
    return position.y >= bounds.minY && position.y <= bounds.maxY;
  },
};

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

export const activeStateUtils = {
  getPosition: (activeState: any): THREE.Vector3 => {
    if (!activeState?.position) {
      return new THREE.Vector3(0, 0, 0);
    }
    
    if (activeState.position instanceof THREE.Vector3) {
      return activeState.position;
    }
    
    if (typeof activeState.position === 'object') {
      return new THREE.Vector3(
        activeState.position.x || 0,
        activeState.position.y || 0,
        activeState.position.z || 0,
      );
    }
    
    return new THREE.Vector3(0, 0, 0);
  },

  getEuler: (activeState: any): THREE.Euler => {
    if (!activeState?.euler) {
      return new THREE.Euler(0, 0, 0);
    }
    
    if (activeState.euler instanceof THREE.Euler) {
      return activeState.euler;
    }
    
    if (typeof activeState.euler === 'object') {
      return new THREE.Euler(
        activeState.euler.x || 0,
        activeState.euler.y || 0,
        activeState.euler.z || 0,
      );
    }
    
    return new THREE.Euler(0, 0, 0);
  },

  getVelocity: (activeState: any): THREE.Vector3 => {
    if (!activeState?.velocity) {
      return new THREE.Vector3(0, 0, 0);
    }
    
    if (activeState.velocity instanceof THREE.Vector3) {
      return activeState.velocity;
    }
    
    if (typeof activeState.velocity === 'object') {
      return new THREE.Vector3(
        activeState.velocity.x || 0,
        activeState.velocity.y || 0,
        activeState.velocity.z || 0,
      );
    }
    
    return new THREE.Vector3(0, 0, 0);
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
  ): THREE.Vector3 => {
    const { xDistance = 15, yDistance = 8, zDistance = 15, euler, mode = 'thirdPerson' } = options;
    
    switch (mode) {
      case 'chase':
        if (euler) {
          const offsetDirection = new THREE.Vector3(
            Math.sin(euler.y),
            1,
            Math.cos(euler.y)
          ).normalize();
          return offsetDirection.multiply(new THREE.Vector3(-xDistance, yDistance, -zDistance));
        }
        return new THREE.Vector3(-xDistance, yDistance, -zDistance);
        
      case 'thirdPerson':
      default:
        return new THREE.Vector3(-xDistance, yDistance, -zDistance);
    }
  },

  getCameraTarget: (
    activeState: any,
    cameraOption: any,
  ): THREE.Vector3 => {
    const position = activeStateUtils.getPosition(activeState);
    return cameraOption.target || position;
  },
}; 