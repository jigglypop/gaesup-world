import * as THREE from 'three';
import { ActiveStateType, CameraOptionType, CameraPropType } from '../../../types';
import { BaseCameraController } from './BaseCameraController';
import { V3 } from '../../utils/vector';
import { cameraUtils } from '../utils';

export class SideScrollController extends BaseCameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const characterPosition = activeState.position
      ? V3(activeState.position.x, activeState.position.y, activeState.position.z)
      : V3(0, 0, 0);

    const xOffset = cameraOption.xDistance ?? -15;
    const yOffset = cameraOption.yDistance ?? 5;
    // Keep the camera's original z-depth relative to the character, or use a fixed one
    const zFollow = characterPosition.z;

    let targetPosition = V3(characterPosition.x + xOffset, characterPosition.y + yOffset, zFollow);

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
