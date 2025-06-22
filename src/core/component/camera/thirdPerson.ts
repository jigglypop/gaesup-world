import * as THREE from 'three';
import { ActiveStateType } from '../../types';
import { CameraOptionType, CameraPropType } from '../../types/camera';
import { cameraUtils, activeStateUtils } from '../../utils/camera';
import { CameraController } from './CameraController';

export default function thirdPerson(prop: CameraPropType) {
  const {
    state,
    worldContext: { activeState },
    cameraOption,
  } = prop;
  if (!state?.camera || !activeState) return;
  const currentPosition = activeStateUtils.getPosition(activeState);
  const offset = activeStateUtils.calculateCameraOffset(currentPosition, {
    xDistance: cameraOption.xDistance,
    yDistance: cameraOption.yDistance,
    zDistance: cameraOption.zDistance,
    mode: 'thirdPerson',
  });
  const targetPosition = currentPosition.clone().add(offset);
  if (cameraOption.bounds) {
    cameraUtils.clampPosition(targetPosition, cameraOption.bounds);
  }

  const deltaTime = prop.state?.delta || 0.016;
  const lookAtTarget = activeStateUtils.getCameraTarget(activeState, cameraOption);
  cameraUtils.preventCameraJitter(state.camera, targetPosition, lookAtTarget, 8.0, deltaTime);
  if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
    cameraUtils.updateFOV(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
  }
}

export class ThirdPersonController extends CameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const position = activeStateUtils.getPosition(activeState);
    const offset = activeStateUtils.calculateCameraOffset(position, {
      xDistance: cameraOption.xDistance,
      yDistance: cameraOption.yDistance,
      zDistance: cameraOption.zDistance,
      mode: 'thirdPerson',
    });
    return position.clone().add(offset);
  }

  public override calculateLookAt(prop: CameraPropType): THREE.Vector3 | undefined {
    const { worldContext: { activeState }, cameraOption } = prop;
    return activeStateUtils.getCameraTarget(activeState, cameraOption);
  }
}
