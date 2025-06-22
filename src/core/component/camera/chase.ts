import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../types';
import { cameraUtils } from '../../utils/camera';
import { BaseCameraController } from './BaseCameraController';

const tempDirection = new THREE.Vector3();
const tempCameraOffset = new THREE.Vector3();

export class ChaseController extends BaseCameraController {
  private fixedOffset = new THREE.Vector3(-15, 8, -15);
  private smoothedOffset = new THREE.Vector3(-15, 8, -15);

  public calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const distance = Math.abs(cameraOption.xDistance ?? 15);
    const height = cameraOption.yDistance ?? 8;

    if (!activeState.position) return camera.position;

    if (cameraOption.mode === 'fixed') {
      this.fixedOffset.set(
        -(cameraOption.xDistance ?? 15),
        height,
        -(cameraOption.zDistance ?? 15),
      );
      return this.tempVector.copy(activeState.position).add(this.fixedOffset);
    }

    if (cameraOption.mode === 'smart' && activeState.velocity) {
      const velocity = activeState.velocity;
      if (velocity.length() > 0.1) {
        tempDirection.copy(velocity).normalize();
        tempCameraOffset.copy(tempDirection).multiplyScalar(-distance);
        tempCameraOffset.y = height;
        this.smoothedOffset.lerp(tempCameraOffset, 0.1);
      }
      return this.tempVector.copy(activeState.position).add(this.smoothedOffset);
    }

    if (activeState.direction && activeState.direction.length() > 0) {
      tempDirection.copy(activeState.direction).normalize();
    } else if (activeState.dir && activeState.dir.length() > 0) {
      tempDirection.copy(activeState.dir).normalize();
    } else {
      tempDirection.set(0, 0, -1);
    }

    tempCameraOffset.copy(tempDirection).multiplyScalar(-distance);
    tempCameraOffset.y = height;

    const targetPosition = this.tempVector.copy(activeState.position).add(tempCameraOffset);

    if (cameraOption.bounds) {
      cameraUtils.clampPosition(targetPosition, cameraOption.bounds);
    }

    return targetPosition;
  }
}
