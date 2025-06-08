import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../context';
import { cameraPropType } from '../../physics/type';
import { V3 } from '../../utils/vector';
import { cameraUtils } from '../utils';
import { CameraPropType } from '../types';
import { gameStore } from '../../store/gameStore';

const tempVector3 = new THREE.Vector3();
const tempVector3_2 = new THREE.Vector3();
const tempDirection = new THREE.Vector3();

export const makeThirdPersonCameraPosition = (
  activeState: ActiveStateType,
  cameraOption: CameraOptionType,
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
      activeState.position.z || 0,
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
  cameraOption: CameraOptionType,
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
  cameraOption: CameraOptionType,
): THREE.Vector3 => {
  return cameraUtils.clampPosition(position, cameraOption.bounds);
};

export const calculateAdaptiveLerpSpeed = (
  currentPos: THREE.Vector3,
  targetPos: THREE.Vector3,
  baseLerpSpeed: number,
  cameraOption: CameraOptionType,
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
  if (!state?.camera || !activeState || !activeState.position || !activeState.euler) return;

  const idealPosition = makeThirdPersonCameraPosition(activeState, cameraOption);
  const idealLookAt = activeState.position.clone();

  // ref store에 이상적인 target 저장
  gameStore.camera.target.copy(idealLookAt);

  const t = 1.0 - Math.pow(1.0 - (cameraOption.smoothing?.position || 0.1), state.delta * 30);

  state.camera.position.lerp(idealPosition, t);
  state.camera.lookAt(idealLookAt);

  if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
    cameraUtils.updateFOVLerp(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
  }
}

export const makeNormalCameraPosition = makeThirdPersonCameraPosition;
export const normal = thirdPerson;
