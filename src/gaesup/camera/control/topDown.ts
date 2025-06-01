import * as THREE from 'three';
import { cameraPropType } from "../../physics/type";
import { V3 } from "../../utils/vector";
import { activeStateType, cameraOptionType } from "../../world/context/type";

export const makeTopDownCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType
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
  }
): THREE.Vector3 => {
  if (!bounds) return position;
  
  const clampedPos = position.clone();
  
  if (bounds.minX !== undefined) clampedPos.x = Math.max(clampedPos.x, bounds.minX);
  if (bounds.maxX !== undefined) clampedPos.x = Math.min(clampedPos.x, bounds.maxX);
  if (bounds.minZ !== undefined) clampedPos.z = Math.max(clampedPos.z, bounds.minZ);
  if (bounds.maxZ !== undefined) clampedPos.z = Math.min(clampedPos.z, bounds.maxZ);
  
  return clampedPos;
};

export default function topDown(prop: cameraPropType) {
  const {
    state,
    worldContext: { cameraOption, activeState },
    controllerOptions: { lerp },
  } = prop;
  
  if (!state || !state.camera) return;

  let targetPosition = makeTopDownCameraPosition(activeState, cameraOption);
  
  if (cameraOption.bounds) {
    targetPosition = clampTopDownPosition(targetPosition, {
      minX: cameraOption.bounds.minX,
      maxX: cameraOption.bounds.maxX,
      minZ: cameraOption.bounds.minZ,
      maxZ: cameraOption.bounds.maxZ,
    });
  }
  
  const lerpSpeed = cameraOption.smoothing?.position ?? lerp.cameraPosition;
  state.camera.position.lerp(targetPosition, lerpSpeed);
  
  state.camera.rotation.set(-Math.PI / 2, 0, 0);
  
  const lookAtTarget = activeState.position.clone();
  lookAtTarget.y = 0;
  state.camera.lookAt(lookAtTarget);
} 