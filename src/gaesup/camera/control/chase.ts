import * as THREE from 'three';
import { ActiveStateType, CameraOptionType, CameraPropType } from '../../../types';
import { V3 } from '../../utils/vector';
import { BaseCameraController } from './BaseCameraController';
import { cameraUtils } from '../utils';

const tempDirection = new THREE.Vector3();
const tempCameraOffset = new THREE.Vector3();

export class ChaseController extends BaseCameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const distance = Math.abs(cameraOption.xDistance ?? 15);
    const height = cameraOption.yDistance ?? 8;

    if (activeState.direction && activeState.direction.length() > 0) {
      tempDirection.copy(activeState.direction).normalize();
    } else if (activeState.dir && activeState.dir.length() > 0) {
      tempDirection.copy(activeState.dir).normalize();
    } else {
      tempDirection.set(0, 0, -1);
    }

    tempCameraOffset.copy(tempDirection).multiplyScalar(-distance);
    tempCameraOffset.y = height;

    const characterPosition = activeState.position
      ? V3(activeState.position.x, activeState.position.y, activeState.position.z)
      : V3(0, 0, 0);

    let targetPosition = characterPosition.add(tempCameraOffset);

    if (cameraOption.bounds) {
      targetPosition = cameraUtils.clampPosition(targetPosition, cameraOption.bounds);
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
    const targetPosition = this.calculateTargetPosition(activeState, cameraOption);
    const lerpSpeed = cameraOption.smoothing?.position ?? 0.15;
    state.camera.position.lerp(targetPosition, lerpSpeed);
    const lookAtTarget = cameraOption.target || activeState.position;
    state.camera.lookAt(lookAtTarget);
    if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
      cameraUtils.updateFOV(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
    }
  }
}
