import * as THREE from 'three';
import { cameraPropType } from '../../physics/type';
import { ActiveStateType, CameraOptionType } from '../../types';
import { cameraUtils } from '../utils';

const tempVector3 = new THREE.Vector3();
const tempForward = new THREE.Vector3(0, 0, -1);
const tempLookAt = new THREE.Vector3();

export const makeFirstPersonCameraPosition = (
  activeState: ActiveStateType,
  cameraOption: CameraOptionType,
): THREE.Vector3 => {
  const yOffset = cameraOption.yDistance ?? 1.6;
  return tempVector3.copy(activeState.position).add(new THREE.Vector3(0, yOffset, 0));
};

export const calculateFirstPersonDirection = (activeState: ActiveStateType): THREE.Vector3 => {
  tempForward.set(0, 0, -1);
  tempForward.applyEuler(activeState.euler);
  return tempForward.normalize();
};

export const applyHeadBobbing = (
  camera: THREE.Camera,
  activeState: ActiveStateType,
  time: number,
  intensity: number = 0.05,
) => {
  const velocity = activeState.velocity.length();
  if (velocity > 0.1) {
    const bobbing = Math.sin(time * 8) * intensity * velocity * 0.1;
    camera.position.y += bobbing;
  }
};

export default function firstPerson(prop: cameraPropType) {
  const {
    state,
    worldContext: { activeState },
    cameraOption,
  } = prop;
  if (!state?.camera) return;
  const targetPosition = makeFirstPersonCameraPosition(activeState, cameraOption);
  const lerpSpeed = cameraOption.smoothing?.position ?? 0.1;
  state.camera.position.lerp(targetPosition, lerpSpeed);
  const lookDirection = calculateFirstPersonDirection(activeState);
  tempLookAt.copy(state.camera.position).add(lookDirection.multiplyScalar(10));
  state.camera.lookAt(tempLookAt);
  if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
    cameraUtils.updateFOVLerp(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
  }
}
