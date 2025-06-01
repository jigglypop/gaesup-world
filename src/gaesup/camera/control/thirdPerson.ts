import * as THREE from 'three';
import { cameraPropType } from "../../physics/type";
import { V3 } from "../../utils/vector";
import { activeStateType, cameraOptionType } from "../../world/context/type";

export const makeThirdPersonCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType
): THREE.Vector3 => {
  const xDist = cameraOption.xDistance ?? cameraOption.XDistance ?? 20;
  const yDist = cameraOption.yDistance ?? cameraOption.YDistance ?? 10;
  const zDist = cameraOption.zDistance ?? cameraOption.ZDistance ?? 20;
  
  let position: THREE.Vector3;
  if (activeState.position instanceof THREE.Vector3) {
    position = activeState.position;
  } else if (activeState.position && typeof activeState.position === 'object') {
    position = new THREE.Vector3(
      activeState.position.x || 0,
      activeState.position.y || 0,
      activeState.position.z || 0
    );
  } else {
    position = new THREE.Vector3(0, 0, 0);
  }
  
  const cameraPosition = position
    .clone()
    .add(V3(xDist, yDist, zDist));
  
  return cameraPosition;
};

export const checkCameraCollision = (
  cameraPosition: THREE.Vector3,
  targetPosition: THREE.Vector3,
  cameraOption: cameraOptionType
): THREE.Vector3 => {
  if (!cameraOption.enableCollision) {
    return cameraPosition;
  }

  const direction = cameraPosition.clone().sub(targetPosition).normalize();
  const distance = cameraPosition.distanceTo(targetPosition);
  const minDistance = Math.abs(cameraOption.maxDistance ?? -7) * 0.3;
  
  if (distance < minDistance) {
    return targetPosition.clone().add(direction.multiplyScalar(minDistance));
  }
  
  return cameraPosition;
};

export const clampCameraPosition = (
  position: THREE.Vector3,
  cameraOption: cameraOptionType
): THREE.Vector3 => {
  if (!cameraOption.bounds) {
    return position;
  }

  const { bounds } = cameraOption;
  const clampedPosition = position.clone();

  if (bounds.minX !== undefined) clampedPosition.x = Math.max(clampedPosition.x, bounds.minX);
  if (bounds.maxX !== undefined) clampedPosition.x = Math.min(clampedPosition.x, bounds.maxX);
  if (bounds.minY !== undefined) clampedPosition.y = Math.max(clampedPosition.y, bounds.minY);
  if (bounds.maxY !== undefined) clampedPosition.y = Math.min(clampedPosition.y, bounds.maxY);
  if (bounds.minZ !== undefined) clampedPosition.z = Math.max(clampedPosition.z, bounds.minZ);
  if (bounds.maxZ !== undefined) clampedPosition.z = Math.min(clampedPosition.z, bounds.maxZ);

  return clampedPosition;
};

export const calculateAdaptiveLerpSpeed = (
  currentPos: THREE.Vector3,
  targetPos: THREE.Vector3,
  baseLerpSpeed: number,
  cameraOption: cameraOptionType
): number => {
  const distance = currentPos.distanceTo(targetPos);
  const maxDistance = Math.abs(cameraOption.maxDistance ?? -7);
  
  const speedMultiplier = Math.min(distance / maxDistance, 2);
  return Math.min(baseLerpSpeed * speedMultiplier, 0.3);
};

export default function thirdPerson(prop: cameraPropType) {
  const {
    state,
    worldContext: { activeState },
    controllerOptions: { lerp },
    cameraOption,
  } = prop;
  
  if (!state || !state.camera) return;

  // activeState.position을 안전하게 Three.js Vector3로 변환
  let currentPosition: THREE.Vector3;
  if (activeState.position instanceof THREE.Vector3) {
    currentPosition = activeState.position;
  } else if (activeState.position && typeof activeState.position === 'object') {
    currentPosition = new THREE.Vector3(
      activeState.position.x || 0,
      activeState.position.y || 0,
      activeState.position.z || 0
    );
  } else {
    currentPosition = new THREE.Vector3(0, 0, 0);
  }

  let targetPosition = makeThirdPersonCameraPosition(activeState, cameraOption);
  
  targetPosition = checkCameraCollision(targetPosition, currentPosition, cameraOption);
  
  targetPosition = clampCameraPosition(targetPosition, cameraOption);
  
  const adaptiveLerpSpeed = cameraOption.smoothing?.position ?? 
    calculateAdaptiveLerpSpeed(
      state.camera.position,
      targetPosition,
      lerp.cameraPosition,
      cameraOption
    );
  
  state.camera.position.lerp(targetPosition, adaptiveLerpSpeed);
  
  const lookAtTarget = cameraOption.target || currentPosition;
  state.camera.lookAt(lookAtTarget);
  
  if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
    const targetFov = cameraOption.fov;
    const currentFov = state.camera.fov;
    const fovLerpSpeed = cameraOption.smoothing?.fov ?? 0.1;
    
    state.camera.fov = THREE.MathUtils.lerp(currentFov, targetFov, fovLerpSpeed);
    state.camera.updateProjectionMatrix();
  }
}

export const makeNormalCameraPosition = makeThirdPersonCameraPosition;
export const normal = thirdPerson; 