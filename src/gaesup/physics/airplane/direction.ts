import { quat } from '@react-three/rapier';
import { V3 } from '../../utils/vector';
import { calcType } from '../type';

export default function direction(prop: calcType) {
  const {
    innerGroupRef,
    worldContext: { activeState, control },
    controllerContext: { airplane },
    matchSizes,
    inputRef,
  } = prop;

  // === 새로운 ref 기반 시스템 우선 사용 ===
  let forward: boolean,
    backward: boolean,
    leftward: boolean,
    rightward: boolean,
    shift: boolean,
    space: boolean;

  if (inputRef && inputRef.current) {
    const keyboard = inputRef.current.keyboard;
    forward = keyboard.forward;
    backward = keyboard.backward;
    leftward = keyboard.leftward;
    rightward = keyboard.rightward;
    shift = keyboard.shift;
    space = keyboard.space;
  } else {
    // === 기존 시스템 fallback (하위 호환성) ===
    ({ forward, backward, leftward, rightward, shift, space } = control);
  }

  const { angleDelta, maxAngle, accelRatio } = airplane;
  if (!matchSizes || !matchSizes['airplaneUrl']) return null;

  let boost = 0;

  boost = space ? Number(shift) : Number(shift) * accelRatio;

  const upDown = Number(backward) - Number(forward);
  const leftRight = Number(rightward) - Number(leftward);
  const front = V3().set(boost, boost, boost);

  activeState.euler.y += -leftRight * angleDelta.y;

  const X = maxAngle.x * upDown;
  const Z = maxAngle.z * leftRight;

  const _x = innerGroupRef.current.rotation.x;
  const _z = innerGroupRef.current.rotation.z;

  const maxX = maxAngle.x;
  const maxZ = maxAngle.z;

  const innerGrounRefRotation = innerGroupRef.current.clone();

  if (_x < -maxX) {
    innerGrounRefRotation.rotation.x = -maxX + X;
  } else if (_x > maxX) {
    innerGrounRefRotation.rotation.x = maxX + X;
  } else {
    innerGrounRefRotation.rotateX(X);
  }

  if (_z < -maxZ) innerGrounRefRotation.rotation.z = -maxZ + Z;
  else if (_z > maxZ) innerGrounRefRotation.rotation.z = maxZ + Z;
  else innerGrounRefRotation.rotateZ(Z);
  activeState.euler.x = innerGrounRefRotation.rotation.x;
  activeState.euler.z = innerGrounRefRotation.rotation.z;

  innerGrounRefRotation.rotation.y = 0;
  innerGroupRef.current.setRotationFromQuaternion(
    quat()
      .setFromEuler(innerGroupRef.current.rotation.clone())
      .slerp(quat().setFromEuler(innerGrounRefRotation.rotation.clone()), 0.2),
  );

  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), -upDown, Math.cos(activeState.euler.y)),
  );
  activeState.dir = activeState.direction.normalize();
}
