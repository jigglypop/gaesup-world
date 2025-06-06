import * as THREE from 'three';
import { cameraPropType } from "../../physics/type";
import { V3 } from "../../utils/vector";
import { ActiveStateType, CameraOptionType } from "../../world/context/type";
import { cameraUtils } from '../utils';

const tempVector3 = new THREE.Vector3();
const tempVector3_2 = new THREE.Vector3();
const tempDirection = new THREE.Vector3();

export const makeThirdPersonCameraPosition = (
  activeState: ActiveStateType,
  cameraOption: CameraOptionType
): THREE.Vector3 => {
  const xDist = cameraOption.xDistance ?? cameraOption.XDistance ?? 20;
  const yDist = cameraOption.yDistance ?? cameraOption.YDistance ?? 10;
  const zDist = cameraOption.zDistance ?? cameraOption.ZDistance ?? 20;
  
  let position: THREE.Vector3;
  if (activeState.position instanceof THREE.Vector3) {
    position = activeState.position;
  } else if (activeState.position && typeof activeState.position === 'object') {
    tempVector3.set(
      activeState.position.x || 0,
      activeState.position.y || 0,
      activeState.position.z || 0
    );
    position = tempVector3;
  } else {
    tempVector3.set(0, 0, 0);
    position = tempVector3;
  }
  
  return tempVector3_2.copy(position).add(V3(xDist, yDist, zDist));
};

export const checkCameraCollision = (
  cameraPosition: THREE.Vector3,
  targetPosition: THREE.Vector3,
  cameraOption: CameraOptionType
): THREE.Vector3 => {
  if (!cameraOption.enableCollision) {
    return cameraPosition;
  }

  tempDirection.copy(cameraPosition).sub(targetPosition).normalize();
  const distance = cameraPosition.distanceTo(targetPosition);
  const minDistance = Math.abs(cameraOption.maxDistance ?? -7) * 0.3;
  
  if (distance < minDistance) {
    return tempVector3.copy(targetPosition).add(tempDirection.multiplyScalar(minDistance));
  }
  
  return cameraPosition;
};

export const clampCameraPosition = (
  position: THREE.Vector3,
  cameraOption: CameraOptionType
): THREE.Vector3 => {
  return cameraUtils.clampPosition(position, cameraOption.bounds);
};

export const calculateAdaptiveLerpSpeed = (
  currentPos: THREE.Vector3,
  targetPos: THREE.Vector3,
  baseLerpSpeed: number,
  cameraOption: CameraOptionType
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
  
  if (!state?.camera) return;

  let currentPosition: THREE.Vector3;
  if (activeState.position instanceof THREE.Vector3) {
    currentPosition = activeState.position;
  } else if (activeState.position && typeof activeState.position === 'object') {
    tempVector3.set(
      activeState.position.x || 0,
      activeState.position.y || 0,
      activeState.position.z || 0
    );
    currentPosition = tempVector3;
  } else {
    tempVector3.set(0, 0, 0);
    currentPosition = tempVector3;
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
    cameraUtils.updateFOVLerp(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
  }
}

export const makeNormalCameraPosition = makeThirdPersonCameraPosition;
export const normal = thirdPerson; 