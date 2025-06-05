import { ActiveStateType, CameraOptionType } from '@/gaesup/types';
import * as THREE from 'three';
import { V3 } from '../../utils/vector';

export const makeTopDownCameraPosition = (
  activeState: ActiveStateType,
  cameraOption: CameraOptionType,
): THREE.Vector3 => {
  const height = Math.abs(cameraOption.yDistance ?? cameraOption.YDistance ?? 20);
  const xOffset = cameraOption.xDistance ?? cameraOption.XDistance ?? 0;
  const zOffset = cameraOption.zDistance ?? cameraOption.ZDistance ?? 0;

  return activeState.position.clone().add(V3(xOffset, height, zOffset));
};

export const clampTopDownPosition = (
  position: THREE.Vector3,
  bounds?: {
    minX?: number;
    maxX?: number;
    minZ?: number;
    maxZ?: number;
  },
): THREE.Vector3 => {
  if (!bounds) return position;

  const clampedPos = position.clone();

  if (bounds.minX !== undefined) clampedPos.x = Math.max(clampedPos.x, bounds.minX);
  if (bounds.maxX !== undefined) clampedPos.x = Math.min(clampedPos.x, bounds.maxX);
  if (bounds.minZ !== undefined) clampedPos.z = Math.max(clampedPos.z, bounds.minZ);
  if (bounds.maxZ !== undefined) clampedPos.z = Math.min(clampedPos.z, bounds.maxZ);

  return clampedPos;
};

export default function topDown(prop: CameraPropType) {
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
    const targetFov = cameraOption.fov;
    const currentFov = state.camera.fov;
    const fovLerpSpeed = cameraOption.smoothing?.fov ?? 0.1;

    state.camera.fov = THREE.MathUtils.lerp(currentFov, targetFov, fovLerpSpeed);
    state.camera.updateProjectionMatrix();
  }
}
