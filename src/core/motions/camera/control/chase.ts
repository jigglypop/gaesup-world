import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../../types';
import { cameraUtils } from '../utils';
import { BaseCameraController } from './BaseCameraController';

const tempDirection = new THREE.Vector3();
const tempCameraOffset = new THREE.Vector3();

export class ChaseController extends BaseCameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const distance = Math.abs(cameraOption.xDistance);
    const height = cameraOption.yDistance;

    if (activeState.direction && activeState.direction.length() > 0) {
      tempDirection.copy(activeState.direction).normalize();
    } else if (activeState.dir && activeState.dir.length() > 0) {
      tempDirection.copy(activeState.dir).normalize();
    } else {
      tempDirection.set(0, 0, -1);
    }

    tempCameraOffset.copy(tempDirection).multiplyScalar(-distance);
    tempCameraOffset.y = height;

    if (!activeState.position) return camera.position;
    const targetPosition = this.tempVector.copy(activeState.position).add(tempCameraOffset);

    // Clamp position
    if (cameraOption.bounds) {
      cameraUtils.clampPosition(targetPosition, cameraOption.bounds);
    }

    return targetPosition;
  }
}
