import { quat } from '@react-three/rapier';
import { RefObject } from 'react';
import * as THREE from 'three';
import { PhysicsState } from '../type';
import { eventBus } from '../stores';

const tempEuler = new THREE.Euler();
const tempQuaternion = new THREE.Quaternion();
const targetQuaternion = new THREE.Quaternion();

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

  let targetX = _x + X;
  let targetZ = _z + Z;

  if (targetX < -maxX) targetX = -maxX;
  else if (targetX > maxX) targetX = maxX;

  if (targetZ < -maxZ) targetZ = -maxZ;
  else if (targetZ > maxZ) targetZ = maxZ;

  activeState.euler.x = targetX;
  activeState.euler.z = targetZ;

  tempEuler.set(targetX, 0, targetZ);
  tempQuaternion.setFromEuler(innerGroupRef.current.rotation);
  targetQuaternion.setFromEuler(tempEuler);
  tempQuaternion.slerp(targetQuaternion, 0.2);
  innerGroupRef.current.setRotationFromQuaternion(tempQuaternion);

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
