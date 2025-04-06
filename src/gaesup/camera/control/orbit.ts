import { quat } from '@react-three/rapier';
import * as THREE from 'three';
import { cameraPropType } from '../../physics/type';
import { V3 } from '../../utils/vector';
import { activeStateType, cameraOptionType } from '../../world/context/type';

// 임시 벡터 객체 생성 - 재사용
const tempVector = new THREE.Vector3();
const tempQuat = new THREE.Quaternion();

export const makeOrbitCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType,
) => {
  const { XDistance, YDistance, ZDistance } = cameraOption;
  // Math.sin과 Math.cos 계산 재사용
  const sinY = Math.sin(activeState.euler.y);
  const cosY = Math.cos(activeState.euler.y);
  // 임시 벡터 재사용하여 불필요한 객체 생성 방지
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
  // 4x4 행렬 연산 대신 쿼터니언 직접 계산으로 성능 개선
  tempQuat.copy(activeState.quat);
  // Y축 기준 180도(PI) 회전 쿼터니언 계산 (한 번만 계산)
  const piRotation = quat().setFromAxisAngle(V3(0, 1, 0), Math.PI);
  state.camera.quaternion.copy(tempQuat.multiply(piRotation));
  state.camera.rotation.copy(activeState.euler);
  state.camera.lookAt(activeState.position);
}
