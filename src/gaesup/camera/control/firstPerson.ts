import * as THREE from 'three';
import { cameraPropType } from '../../physics/type';
import { ActiveStateType, CameraOptionType } from '../../types';

export const makeFirstPersonCameraPosition = (
  activeState: ActiveStateType,
  cameraOption: CameraOptionType,
): THREE.Vector3 => {
  const yOffset = cameraOption.yDistance ?? 1.6;
  const cameraPosition = activeState.position.clone().add(new THREE.Vector3(0, yOffset, 0));
  return cameraPosition;
};

export const calculateFirstPersonDirection = (activeState: ActiveStateType): THREE.Vector3 => {
  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyEuler(activeState.euler);
  return forward.normalize();
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
  if (!state || !state.camera) return;
  const targetPosition = makeFirstPersonCameraPosition(activeState, cameraOption);
  const lerpSpeed = cameraOption.smoothing?.position ?? 0.1;
  state.camera.position.lerp(targetPosition, lerpSpeed);
  const lookDirection = calculateFirstPersonDirection(activeState);
  const lookAtTarget = state.camera.position.clone().add(lookDirection.multiplyScalar(10));
  state.camera.lookAt(lookAtTarget);
  if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
    const targetFov = cameraOption.fov;
    const currentFov = state.camera.fov;
    const fovLerpSpeed = cameraOption.smoothing?.fov ?? 0.1;
    state.camera.fov = THREE.MathUtils.lerp(currentFov, targetFov, fovLerpSpeed);
    state.camera.updateProjectionMatrix();
  }
}
