import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../../types';
import { CameraPropType } from '../../types';
import { V3 } from '@utils/vector';
import { cameraUtils } from '../utils';

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
    if (cameraOption.target) {
      state.camera.lookAt(cameraOption.target);
    }

    if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
      cameraUtils.updateFOV(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
    }
  }
}
