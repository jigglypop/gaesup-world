import * as THREE from 'three';
import { cameraPropType } from '../../physics/type';
import { activeStateType, cameraOptionType } from '../../world/context/type';

// 임시 벡터 객체 생성 - 재사용
const tempVector = new THREE.Vector3();

export const makeNormalCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType,
) => {
  const { XDistance, YDistance, ZDistance } = cameraOption;
  return tempVector.set(XDistance, YDistance, ZDistance).add(activeState.position);
};

export default function normal(prop: cameraPropType) {
  const {
    state,
    worldContext: { cameraOption },
    controllerOptions: { lerp },
  } = prop;
  if (!state || !state.camera) return;
  state.camera.position.lerp(cameraOption.position, lerp.cameraPosition);
  state.camera.lookAt(cameraOption.target);
}
