import * as THREE from 'three';
import { cameraPropType } from '../../physics/type';
import { V3 } from '../../utils/vector';
import { ActiveStateType, CameraOptionType } from '../../context';
import { cameraUtils } from '../utils';

const tempVector3 = new THREE.Vector3();
const tempDirection = new THREE.Vector3();
const tempCameraOffset = new THREE.Vector3();

export const makeOrbitCameraPosition = (
  activeState: ActiveStateType,
  cameraOption: CameraOptionType,
): THREE.Vector3 => {
  const distance = Math.abs(cameraOption.xDistance ?? cameraOption.XDistance ?? 15);
  const height = cameraOption.yDistance ?? cameraOption.YDistance ?? 8;
  const zOffset = cameraOption.zDistance ?? cameraOption.ZDistance ?? 15;
  
  console.log('ORBIT DEBUG - activeState:', {
    position: activeState.position,
    direction: activeState.direction,
    dir: activeState.dir,
    euler: activeState.euler
  });
  
  if (activeState.direction && activeState.direction.length() > 0) {
    tempDirection.copy(activeState.direction).normalize();
  } else if (activeState.dir && activeState.dir.length() > 0) {
    tempDirection.copy(activeState.dir).normalize();
  } else {
    tempDirection.set(0, 0, -1);
  }
  
  console.log('ORBIT DEBUG - direction:', tempDirection);
  
  tempCameraOffset.copy(tempDirection).multiplyScalar(-distance);
  tempCameraOffset.y = height;
  tempCameraOffset.z += zOffset * 0.3;
  
  const finalPosition = tempVector3.copy(activeState.position).add(tempCameraOffset);
  
  console.log('ORBIT DEBUG - finalPosition:', finalPosition);
  
  return finalPosition;
};

const clampOrbitPosition = (
  position: THREE.Vector3,
  cameraOption: CameraOptionType,
): THREE.Vector3 => {
  if (!cameraOption.bounds) return position;

  const { bounds } = cameraOption;
  if (bounds.minY !== undefined) position.y = Math.max(position.y, bounds.minY);
  if (bounds.maxY !== undefined) position.y = Math.min(position.y, bounds.maxY);
  
  return position;
};

export default function thirdPersonOrbit(prop: cameraPropType) {
  const {
    state,
    worldContext: { activeState },
    cameraOption,
  } = prop;

  console.log('ORBIT CAMERA CALLED - state:', !!state?.camera, 'activeState:', activeState);

  if (!state?.camera) return;

  let targetPosition = makeOrbitCameraPosition(activeState, cameraOption);
  targetPosition = clampOrbitPosition(targetPosition, cameraOption);

  const lerpSpeed = cameraOption.smoothing?.position ?? 0.08;
  
  console.log('ORBIT DEBUG - lerp from:', state.camera.position, 'to:', targetPosition, 'speed:', lerpSpeed);
  
  state.camera.position.lerp(targetPosition, lerpSpeed);

  const lookAtTarget = cameraOption.target || activeState.position;
  state.camera.lookAt(lookAtTarget);

  if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
    cameraUtils.updateFOVLerp(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
  }
}

export const orbit = thirdPersonOrbit; 