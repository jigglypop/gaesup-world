import { quat } from '@react-three/rapier';
import * as THREE from 'three';
import { cameraPropType } from '../../physics/type';
import { V3 } from '../../utils/vector';
import { activeStateType, cameraOptionType } from '../../world/context/type';

const tempVector = new THREE.Vector3();
const tempQuat = new THREE.Quaternion();

export const makeOrbitCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType,
) => {
  const { XDistance, YDistance, ZDistance } = cameraOption;
  const sinY = Math.sin(activeState.euler.y);
  const cosY = Math.cos(activeState.euler.y);
  return tempVector.set(-XDistance * sinY, YDistance, -ZDistance * cosY).add(activeState.position);
};

export default function orbit(prop: cameraPropType) {
  const {
    state,
    worldContext: { activeState, cameraOption },
    controllerOptions: { lerp },
  } = prop;
  if (!state || !state.camera) return;
  const cameraPosition = makeOrbitCameraPosition(activeState, cameraOption);
  state.camera.position.lerp(cameraPosition, lerp.cameraTurn);
  tempQuat.copy(activeState.quat);
  const piRotation = quat().setFromAxisAngle(V3(0, 1, 0), Math.PI);
  state.camera.quaternion.copy(tempQuat.multiply(piRotation));
  state.camera.rotation.copy(activeState.euler);
  state.camera.lookAt(activeState.position);
}
