import * as THREE from 'three';
import { cameraPropType } from '../../physics/type';
import { V3 } from '../../utils/vector';
import { ActiveStateType, CameraOptionType } from '../../world/context/type';
import { cameraUtils } from '../utils';

export const makeTopDownCameraPosition = (
  activeState: ActiveStateType,
  cameraOption: CameraOptionType,
): THREE.Vector3 => {
  const height = Math.abs(cameraOption.yDistance ?? cameraOption.YDistance ?? 20);
  const xOffset = cameraOption.xDistance ?? cameraOption.XDistance ?? 0;
  const zOffset = cameraOption.zDistance ?? cameraOption.ZDistance ?? 0;

  return activeState.position.clone().add(V3(xOffset, height, zOffset));
};

export const clampTopDownPosition = cameraUtils.clampPosition;

export default function topDown(prop: cameraPropType) {
  const {
    state,
    worldContext: { activeState },
    controllerOptions: { lerp },
    cameraOption,
  } = prop;

  if (!state || !state.camera) return;

  const targetPosition = makeTopDownCameraPosition(activeState, cameraOption);

  const lerpSpeed = cameraOption.smoothing?.position ?? lerp.cameraPosition;
  state.camera.position.lerp(targetPosition, lerpSpeed);

  const lookAtTarget = cameraOption.target || activeState.position;
  state.camera.lookAt(lookAtTarget);

  if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
    cameraUtils.updateFOVLerp(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
  }
}
