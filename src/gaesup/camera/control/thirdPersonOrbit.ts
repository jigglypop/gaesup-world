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
    worldContext: { activeState, cameraOption },
    controllerOptions: { lerp },
  } = prop;
  
  if (!state || !state.camera) return;
  
  const cameraPosition = makeThirdPersonOrbitCameraPosition(activeState, cameraOption);
  
  const lerpSpeed = cameraOption.smoothing?.position ?? lerp.cameraTurn;
  state.camera.position.lerp(cameraPosition.clone(), lerpSpeed);
  
  if (cameraOption.smoothing?.rotation) {
    smoothOrbitRotation(state.camera, activeState, cameraOption.smoothing.rotation);
  } else {
    state.camera.quaternion.copy(
      activeState.quat.clone().multiply(quat().setFromAxisAngle(V3(0, 1, 0), Math.PI)),
    );
    state.camera.rotation.copy(activeState.euler);
  }
  
  state.camera.lookAt(activeState.position.clone());
}

export const makeOrbitCameraPosition = makeThirdPersonOrbitCameraPosition;
export const orbit = thirdPersonOrbit; 