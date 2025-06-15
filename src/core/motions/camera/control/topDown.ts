import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../../types';
import { CameraPropType } from '../../types';
import { BaseCameraController } from './BaseCameraController';
import { V3 } from '@utils/vector';
import { cameraUtils } from '../utils';

export class TopDownController extends BaseCameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const characterPosition = activeState.position
      ? V3(activeState.position.x, activeState.position.y, activeState.position.z)
      : V3(0, 0, 0);

    const height = Math.abs(cameraOption.yDistance ?? 20);
    const xOffset = cameraOption.xDistance ?? 0;
    const zOffset = cameraOption.zDistance ?? 0;

    let targetPosition = characterPosition.clone().add(V3(xOffset, height, zOffset));

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

    if (!state?.camera || !activeState?.position) return;

    const targetPosition = this.calculateTargetPosition(activeState, cameraOption);

    const lerpSpeed = cameraOption.smoothing?.position ?? 0.1;
    state.camera.position.lerp(targetPosition, lerpSpeed);

    const lookAtTarget = cameraOption.target || activeState.position;
    state.camera.lookAt(lookAtTarget);

    if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
      cameraUtils.updateFOV(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
    }
  }
}
