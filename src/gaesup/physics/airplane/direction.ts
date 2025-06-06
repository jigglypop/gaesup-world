import { quat } from '@react-three/rapier';
import { RefObject } from 'react';
import * as THREE from 'three';
import { PhysicsState } from '../type';
import { eventBus } from '../stores';

export default function direction(
  physicsState: PhysicsState,
  innerGroupRef: RefObject<THREE.Group>,
  matchSizes: unknown,
  controlMode?: string,
) {
  const { activeState, keyboard, airplaneConfig } = physicsState;
  const { forward, backward, leftward, rightward, shift, space } = keyboard;
  const {
    angleDelta = { x: 0, y: 0, z: 0 },
    maxAngle = { x: 0, y: 0, z: 0 },
    accelRatio = 1,
  } = airplaneConfig || {};

  if (!innerGroupRef.current) return;
  let boost = 1;
  if (shift) boost *= accelRatio;
  if (space) boost *= 1.5;
  const upDown = Number(backward) - Number(forward);
  const leftRight = Number(rightward) - Number(leftward);
  if (controlMode === 'chase') {
    activeState.euler.y += -leftRight * angleDelta.y * 0.5;
  } else {
    activeState.euler.y += -leftRight * angleDelta.y;
  }
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

  // 기존 direction 객체 재사용
  activeState.direction.set(
    Math.sin(activeState.euler.y) * boost,
    -upDown * boost,
    Math.cos(activeState.euler.y) * boost,
  );
  activeState.dir.copy(activeState.direction).normalize();
  eventBus.emit('ROTATION_UPDATE', {
    euler: activeState.euler,
    direction: activeState.direction,
    dir: activeState.dir,
  });
}
