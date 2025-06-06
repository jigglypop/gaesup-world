import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../context';
import { CameraPropType } from '../type';
import { cameraUtils } from '../utils';

const tempDirection = new THREE.Vector3();
const tempCameraOffset = new THREE.Vector3();
const tempCameraPosition = new THREE.Vector3();

export const makeChaseCameraPosition = (
  activeState: ActiveStateType,
  cameraOption: CameraOptionType,
): THREE.Vector3 => {
  const distance = Math.abs(cameraOption.xDistance ?? cameraOption.XDistance ?? 15);
  const height = cameraOption.yDistance ?? cameraOption.YDistance ?? 8;
  if (activeState.direction && activeState.direction.length() > 0) {
    tempDirection.copy(activeState.direction).normalize();
  } else if (activeState.dir && activeState.dir.length() > 0) {
    tempDirection.copy(activeState.dir).normalize();
  } else {
    tempDirection.set(0, 0, -1);
  }
  tempCameraOffset.copy(tempDirection).multiplyScalar(-distance);
  tempCameraOffset.y = height;
  tempCameraPosition.copy(activeState.position).add(tempCameraOffset);
  return tempCameraPosition;
};

const clampChasePosition = (
  position: THREE.Vector3,
  cameraOption: CameraOptionType,
): THREE.Vector3 => {
  if (!cameraOption.bounds) return position;
  const { bounds } = cameraOption;
  if (bounds.minY !== undefined) position.y = Math.max(position.y, bounds.minY);
  if (bounds.maxY !== undefined) position.y = Math.min(position.y, bounds.maxY);
  return position;
};

export default function chase(prop: CameraPropType) {
  const {
    state,
    worldContext: { activeState },
    cameraOption,
  } = prop;
  if (!state?.camera || !activeState) return;
  let targetPosition = makeChaseCameraPosition(activeState, cameraOption);
  targetPosition = clampChasePosition(targetPosition, cameraOption);
  const lerpSpeed = cameraOption.smoothing?.position ?? 0.15;
  state.camera.position.lerp(targetPosition, lerpSpeed);
  const lookAtTarget = cameraOption.target || activeState.position;
  const tempLookAt = new THREE.Vector3().copy(lookAtTarget);
  state.camera.lookAt(tempLookAt);
  if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
    cameraUtils.updateFOVLerp(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
  }
}
