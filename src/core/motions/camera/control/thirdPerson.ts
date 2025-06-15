import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../../types';
import { CameraPropType } from '../../types';
import { V3 } from '@utils/vector';
import { cameraUtils } from '../utils';
import { BaseCameraController } from './BaseCameraController';

const tempVector3 = new THREE.Vector3();
const tempVector3_2 = new THREE.Vector3();
const tempDirection = new THREE.Vector3();
const tempCameraOffset = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const tempEuler = new THREE.Euler(0, 0, 0, 'YXZ');

export class ThirdPersonController extends BaseCameraController {
  private pitch: number = 0.2; // Initial camera pitch
  private yaw: number = 0; // Initial camera yaw

  public calculateTargetPosition(
    activeState: ActiveStateType,
    cameraOption: CameraOptionType,
    prop: CameraPropType,
  ): THREE.Vector3 {
    const {
      xDistance = 15,
      yDistance = 8,
      enableCollision,
      maxDistance = -7,
      bounds,
    } = cameraOption;

    const characterPosition = activeState.position
      ? V3(activeState.position.x, activeState.position.y, activeState.position.z)
      : V3(0, 0, 0);

    // Get character's direction
    if (activeState.direction && activeState.direction.length() > 0.01) {
      tempDirection.copy(activeState.direction).normalize();
    } else {
      // Fallback to a default direction if no direction is available
      tempDirection.set(0, 0, 1);
    }

    // Update yaw based on mouse input if active
    if (prop.worldContext.input?.pointer.isActive) {
      this.yaw -= prop.worldContext.input.pointer.angle * 2;
    } else {
      // Gradually align yaw with character direction when mouse is not active
      const characterYaw = Math.atan2(tempDirection.x, tempDirection.z);
      this.yaw += (characterYaw - this.yaw) * 0.1;
    }

    tempEuler.set(this.pitch, this.yaw, 0);
    tempQuaternion.setFromEuler(tempEuler);

    // 1. Calculate ideal position based on direction
    tempCameraOffset.set(0, 0, -xDistance).applyQuaternion(tempQuaternion);
    tempCameraOffset.y = yDistance;
    let targetPosition = characterPosition.clone().add(tempCameraOffset);

    // 2. Check for collision
    if (enableCollision) {
      const direction = targetPosition.clone().sub(characterPosition).normalize();
      const distance = targetPosition.distanceTo(characterPosition);
      const minDistance = Math.abs(maxDistance) * 0.3;
      if (distance < minDistance) {
        targetPosition = characterPosition.clone().add(direction.multiplyScalar(minDistance));
      }
    }

    // 3. Clamp to bounds
    if (bounds) {
      targetPosition = cameraUtils.clampPosition(targetPosition, bounds);
    }

    return targetPosition;
  }

  public override update(prop: CameraPropType): void {
    const {
      state,
      worldContext: { activeState },
      cameraOption,
    } = prop;
    if (!state?.camera || !activeState || !activeState.position) return;

    const targetPosition = this.calculateTargetPosition(activeState, cameraOption, prop);
    const lookAtTarget = cameraOption.target || activeState.position;
    const deltaTime = (state as any).delta || 0.016;

    cameraUtils.preventCameraJitter(state.camera, targetPosition, lookAtTarget, 8.0, deltaTime);

    if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
      cameraUtils.updateFOV(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
    }
  }
}

const thirdPersonController = new ThirdPersonController();
const boundUpdate = thirdPersonController.update.bind(thirdPersonController);

export default boundUpdate;
export const normal = boundUpdate;

export const makeNormalCameraPosition = (
  activeState: ActiveStateType,
  cameraOption: CameraOptionType,
): THREE.Vector3 => {
  const xDist = cameraOption.xDistance ?? cameraOption.XDistance ?? 20;
  const yDist = cameraOption.yDistance ?? cameraOption.YDistance ?? 10;
  const zDist = cameraOption.zDistance ?? cameraOption.ZDistance ?? 20;
  let position: THREE.Vector3;
  if (activeState.position instanceof THREE.Vector3) {
    position = activeState.position;
  } else if (activeState.position && typeof activeState.position === 'object') {
    tempVector3.set(
      activeState.position.x || 0,
      activeState.position.y || 0,
      activeState.position.z || 0,
    );
    position = tempVector3;
  } else {
    tempVector3.set(0, 0, 0);
    position = tempVector3;
  }
  return tempVector3_2.copy(position).add(V3(xDist, yDist, zDist));
};

export const checkCameraCollision = (
  cameraPosition: THREE.Vector3,
  targetPosition: THREE.Vector3,
  cameraOption: CameraOptionType,
): THREE.Vector3 => {
  if (!cameraOption.enableCollision) {
    return cameraPosition;
  }
  tempDirection.copy(cameraPosition).sub(targetPosition).normalize();
  const distance = cameraPosition.distanceTo(targetPosition);
  const minDistance = Math.abs(cameraOption.maxDistance ?? -7) * 0.3;
  if (distance < minDistance) {
    return tempVector3.copy(targetPosition).add(tempDirection.multiplyScalar(minDistance));
  }
  return cameraPosition;
};

export const clampCameraPosition = (
  position: THREE.Vector3,
  cameraOption: CameraOptionType,
): THREE.Vector3 => {
  return cameraUtils.clampPosition(position, cameraOption.bounds);
};

export const calculateAdaptiveLerpSpeed = (
  currentPos: THREE.Vector3,
  targetPos: THREE.Vector3,
  baseLerpSpeed: number,
  cameraOption: CameraOptionType,
): number => {
  const distance = currentPos.distanceTo(targetPos);
  const maxDistance = Math.abs(cameraOption.maxDistance ?? -7);

  const speedMultiplier = Math.min(distance / maxDistance, 2);
  return Math.min(baseLerpSpeed * speedMultiplier, 0.3);
};
