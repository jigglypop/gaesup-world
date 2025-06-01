import * as THREE from 'three';
import { quat } from '@react-three/rapier';
import { cameraPropType } from '../../physics/type';
import { V3 } from '../../utils/vector';
import { activeStateType, cameraOptionType } from '../../world/context/type';

export const makeThirdPersonOrbitCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType,
): THREE.Vector3 => {
  const xDist = cameraOption.xDistance ?? cameraOption.XDistance ?? 20;
  const yDist = cameraOption.yDistance ?? cameraOption.YDistance ?? 10;
  const zDist = cameraOption.zDistance ?? cameraOption.ZDistance ?? 20;
  
  const cameraPosition = activeState.position.clone().add(
    V3(Math.sin(activeState.euler.y), 1, Math.cos(activeState.euler.y))
      .normalize()
      .clone()
      .multiply(V3(-xDist, yDist, -zDist)),
  );
  return cameraPosition;
};

export const smoothOrbitRotation = (
  camera: THREE.Camera,
  activeState: activeStateType,
  smoothingSpeed: number = 0.1
) => {
  const targetQuaternion = activeState.quat.clone().multiply(quat().setFromAxisAngle(V3(0, 1, 0), Math.PI));
  
  if (camera.quaternion) {
    camera.quaternion.slerp(targetQuaternion, smoothingSpeed);
  }
};

export default function thirdPersonOrbit(prop: cameraPropType) {
  const {
    state,
    worldContext: { activeState },
    controllerOptions: { lerp },
    cameraOption,
  } = prop;
  
  if (!state || !state.camera) return;

  const targetPosition = makeThirdPersonOrbitCameraPosition(activeState, cameraOption);
  
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

export const makeOrbitCameraPosition = makeThirdPersonOrbitCameraPosition;
export const orbit = thirdPersonOrbit; 