import { calcType } from '../types';
import { V3, calcAngleByVector } from '../utils/vector';
import { vec3 } from '@react-three/rapier';

const normalDirection = (worldContext: calcType['worldContext']) => {
  const { activeState, control, mode, clicker } = worldContext;
  const { forward, backward, leftward, rightward } = control;
  if (mode.controller === 'clicker') {
    activeState.euler.y = Math.PI / 2 - clicker.angle;
    activeState.dir.set(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y));
    return;
  }
  const dirX = Number(leftward) - Number(rightward);
  const dirZ = Number(forward) - Number(backward);
  if (dirX === 0 && dirZ === 0) return;
  const dir = V3(dirX, 0, dirZ);
  const angle = calcAngleByVector(dir);
  activeState.euler.y = angle;
  activeState.dir.set(dirX, 0, dirZ);
};

const orbitDirection = (worldContext: calcType['worldContext']) => {
  const { activeState, control, mode, clicker } = worldContext;
  const { forward, backward, leftward, rightward } = control;
  const dirX = Number(leftward) - Number(rightward);
  const dirZ = Number(forward) - Number(backward);
  let start = 0;
  if (mode.controller === 'clicker') {
    activeState.euler.y = Math.PI / 2 - clicker.angle;
    start = 1;
  } else {
    if (dirX === 0 && dirZ === 0) return;
    activeState.euler.y += (dirX * Math.PI) / 32;
    start = dirZ;
  }
  const front = V3(start, 0, start);
  activeState.direction = front.multiply(
    V3(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y)),
  );
  activeState.dir = activeState.direction.normalize();
};
const vehicleDirection = (prop: calcType) => {
  const { worldContext } = prop;
  const { activeState, control } = worldContext;
  const { forward, backward, leftward, rightward } = control;
  const xAxis = Number(leftward) - Number(rightward);
  const zAxis = Number(forward) - Number(backward);
  const front = vec3().set(zAxis, 0, zAxis);
  activeState.euler.y += xAxis * (Math.PI / 64);
  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y)),
  );
  activeState.dir = activeState.direction.normalize();
};

const airplaneDirection = (prop: calcType) => {
  const { worldContext, controllerContext, innerGroupRef, matchSizes } = prop;
  const { activeState, control } = worldContext;
  const { airplane } = controllerContext;
  const { forward, backward, leftward, rightward, shift, space } = control;
  const { angleDelta, maxAngle, accelRatio } = airplane;
  if (!matchSizes || !matchSizes['airplaneUrl']) return;
  const boost = space ? Number(shift) : Number(shift) * accelRatio;
  const upDown = Number(backward) - Number(forward);
  const leftRight = Number(rightward) - Number(leftward);
  const front = V3().set(boost, boost, boost);
  activeState.euler.y += -leftRight * angleDelta.y;
  if (!innerGroupRef?.current) return;
  const _x = innerGroupRef.current.rotation.x;
  const _z = innerGroupRef.current.rotation.z;

  const X = maxAngle.x * upDown;
  const Z = maxAngle.z * leftRight;
  if (_x < -maxAngle.x) {
    innerGroupRef.current.rotation.x = -maxAngle.x + X;
  } else if (_x > maxAngle.x) {
    innerGroupRef.current.rotation.x = maxAngle.x + X;
  } else {
    innerGroupRef.current.rotation.x += X;
  }
  if (_z < -maxAngle.z) {
    innerGroupRef.current.rotation.z = -maxAngle.z + Z;
  } else if (_z > maxAngle.z) {
    innerGroupRef.current.rotation.z = maxAngle.z + Z;
  } else {
    innerGroupRef.current.rotation.z += Z;
  }

  activeState.euler.x = innerGroupRef.current.rotation.x;
  activeState.euler.z = innerGroupRef.current.rotation.z;
  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), -upDown, Math.cos(activeState.euler.y)),
  );
  activeState.dir = activeState.direction.normalize();
};
export const calculateDirection = (prop: calcType) => {
  const { worldContext } = prop;
  const { mode } = worldContext;
  switch (mode.type) {
    case 'character':
      if (mode.control === 'normal') normalDirection(worldContext);
      else if (mode.control === 'orbit') orbitDirection(worldContext);
      break;
    case 'vehicle':
      vehicleDirection(prop);
      break;
    case 'airplane':
      airplaneDirection(prop);
      break;
  }
};
