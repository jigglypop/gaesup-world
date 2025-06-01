import * as THREE from 'three';
import { cameraPropType } from "../../physics/type";
import { V3 } from "../../utils/vector";
import { activeStateType, cameraOptionType } from "../../world/context/type";

export const makeFirstPersonCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType
): THREE.Vector3 => {
  const yOffset = cameraOption.yDistance ?? cameraOption.YDistance ?? 1.6;
  
  return activeState.position.clone().add(V3(0, yOffset, 0));
};

export const applyHeadBobbing = (
  camera: THREE.Camera,
  activeState: activeStateType,
  time: number,
  intensity: number = 0.05
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
    worldContext: { cameraOption, activeState },
    controllerOptions: { lerp },
  } = prop;
  
  if (!state || !state.camera) return;

  const targetPosition = makeFirstPersonCameraPosition(activeState, cameraOption);
  
  const lerpSpeed = cameraOption.smoothing?.position ?? lerp.cameraPosition;
  state.camera.position.lerp(targetPosition, lerpSpeed);
  
  state.camera.rotation.copy(activeState.euler);
  
  if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
    const targetFov = cameraOption.fov;
    const currentFov = state.camera.fov;
    const fovLerpSpeed = cameraOption.smoothing?.fov ?? 0.1;
    
    state.camera.fov = THREE.MathUtils.lerp(currentFov, targetFov, fovLerpSpeed);
    state.camera.updateProjectionMatrix();
  }
} 