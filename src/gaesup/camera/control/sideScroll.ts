import * as THREE from 'three';
import { cameraPropType } from '../../physics/type';
import { V3 } from '../../utils/vector';
import { ActiveStateType, CameraOptionType } from '../../context';
import { cameraUtils } from '../utils';

export const makeSideScrollCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType,
): THREE.Vector3 => {
  const xOffset = cameraOption.xDistance ?? cameraOption.XDistance ?? -15;
  const yOffset = cameraOption.yDistance ?? cameraOption.YDistance ?? 5;
  const zFollow = activeState.position.z;
  return V3(activeState.position.x + xOffset, activeState.position.y + yOffset, zFollow);
};

export const clampSideScrollPosition = cameraUtils.clampPosition;

export default function sideScroll(prop: cameraPropType) {
  const {
    state,
    worldContext: { activeState },
    controllerOptions: { lerp },
    cameraOption,
  } = prop;

  if (!state || !state.camera) return;

  const targetPosition = makeSideScrollCameraPosition(activeState, cameraOption);

  const lerpSpeed = cameraOption.smoothing?.position ?? lerp.cameraPosition;
  state.camera.position.lerp(targetPosition, lerpSpeed);

  const lookAtTarget = cameraOption.target || activeState.position;
  state.camera.lookAt(lookAtTarget);

  if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
    cameraUtils.updateFOVLerp(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
  }
}
