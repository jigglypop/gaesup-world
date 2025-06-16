import * as THREE from 'three';
import { ActiveStateType, CameraOptionType, gaesupWorldContextType } from '../../../types';
import { CameraPropType } from '../../types';
import { cameraUtils } from '../utils';
import { BaseCameraController } from './BaseCameraController';
import { V3 } from '@utils/vector';

const tempVector3 = new THREE.Vector3();
const tempVector3_2 = new THREE.Vector3();
const tempDirection = new THREE.Vector3();

export const makeThirdPersonCameraPosition = (
  activeState: ActiveStateType,
  cameraOption: CameraOptionType,
): THREE.Vector3 => {
  const xDist = cameraOption.xDistance ?? 20;
  const yDist = cameraOption.yDistance ?? 10;
  const zDist = cameraOption.zDistance ?? 20;

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

  const offset = new THREE.Vector3(xDist, yDist, zDist);

  if (activeState.quat) {
    const characterRotation = new THREE.Quaternion(
      activeState.quat.x,
      activeState.quat.y,
      activeState.quat.z,
      activeState.quat.w,
    );
    offset.applyQuaternion(characterRotation);
  }

  return tempVector3_2.copy(position).add(offset);
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
  if (cameraOption.bounds) {
    return cameraUtils.clampPosition(position, cameraOption.bounds);
  }
  return position;
};

export default function thirdPerson(prop: CameraPropType) {
  const {
    state,
    worldContext: { activeState },
    cameraOption,
  } = prop;

  if (!state?.camera || !activeState) return;

  let currentPosition: THREE.Vector3;
  if (activeState.position instanceof THREE.Vector3) {
    currentPosition = activeState.position;
  } else if (activeState.position && typeof activeState.position === 'object') {
    tempVector3.set(
      activeState.position.x || 0,
      activeState.position.y || 0,
      activeState.position.z || 0,
    );
    currentPosition = tempVector3;
  } else {
    currentPosition = new THREE.Vector3(0, 0, 0);
  }

  let targetPosition = makeThirdPersonCameraPosition(activeState, cameraOption);
  targetPosition = clampCameraPosition(targetPosition, cameraOption);

  const deltaTime = prop.state?.delta || 0.016;
  const lookAtTarget = cameraOption.target || currentPosition;

  cameraUtils.preventCameraJitter(state.camera, targetPosition, lookAtTarget, 8.0, deltaTime);

  if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
    cameraUtils.updateFOV(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
  }
}

export class ThirdPersonController extends BaseCameraController {
  private _checkCameraCollision(
    cameraPosition: THREE.Vector3,
    targetPosition: THREE.Vector3,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
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
  }

  public calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const offset = new THREE.Vector3(
      cameraOption.xDistance,
      cameraOption.yDistance,
      cameraOption.zDistance,
    );

    if (!activeState.position) {
      return camera.position;
    }

    const characterPosition = V3(
      activeState.position.x,
      activeState.position.y,
      activeState.position.z,
    );

    if (activeState.quat) {
      const characterRotation = new THREE.Quaternion(
        activeState.quat.x,
        activeState.quat.y,
        activeState.quat.z,
        activeState.quat.w,
      );
      offset.applyQuaternion(characterRotation);
    }

    let targetCameraPosition = this.tempVector.copy(characterPosition).add(offset);

    targetCameraPosition = this._checkCameraCollision(
      targetCameraPosition,
      characterPosition,
      cameraOption,
    );

    if (cameraOption.bounds) {
      cameraUtils.clampPosition(targetCameraPosition, cameraOption.bounds);
    }

    return targetCameraPosition;
  }
}
