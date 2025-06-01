import * as THREE from 'three';
import { cameraPropType } from "../../physics/type";
import { V3 } from "../../utils/vector";
import { activeStateType, cameraOptionType } from "../../world/context/type";

export const makeSideScrollCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType
): THREE.Vector3 => {
  const xOffset = cameraOption.xDistance ?? cameraOption.XDistance ?? -15;
  const yOffset = cameraOption.yDistance ?? cameraOption.YDistance ?? 5;
  const zFollow = activeState.position.z;
  
  return V3(activeState.position.x + xOffset, activeState.position.y + yOffset, zFollow);
};

export const clampSideScrollPosition = (
  position: THREE.Vector3,
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  }
): THREE.Vector3 => {
  if (!bounds) return position;
  
  const clampedPos = position.clone();
  
  if (bounds.minX !== undefined) clampedPos.x = Math.max(clampedPos.x, bounds.minX);
  if (bounds.maxX !== undefined) clampedPos.x = Math.min(clampedPos.x, bounds.maxX);
  if (bounds.minY !== undefined) clampedPos.y = Math.max(clampedPos.y, bounds.minY);
  if (bounds.maxY !== undefined) clampedPos.y = Math.min(clampedPos.y, bounds.maxY);
  
  return clampedPos;
};

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
    const targetFov = cameraOption.fov;
    const currentFov = state.camera.fov;
    const fovLerpSpeed = cameraOption.smoothing?.fov ?? 0.1;
    
    state.camera.fov = THREE.MathUtils.lerp(currentFov, targetFov, fovLerpSpeed);
    state.camera.updateProjectionMatrix();
  }
} 