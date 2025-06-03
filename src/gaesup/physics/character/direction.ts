import * as THREE from 'three';
import { ActiveStateType } from '../../types';
import { calcAngleByVector, calcNorm, V3 } from '../../utils/vector';
import { calcType, PhysicsState } from '../type';

function handleClickerQueue(calcProp: calcType) {
  if (!calcProp.rigidBodyRef.current || !calcProp.inputRef?.current) return;
  const currentPos = calcProp.rigidBodyRef.current.translation();
  const mouse = calcProp.inputRef.current.mouse;
  const { clickerOption } = calcProp.worldContext || {};
  if (!mouse.isActive || !clickerOption?.queue) return;
  const currentPosVector3 = V3(currentPos.x, currentPos.y, currentPos.z);
  const norm = calcNorm(currentPosVector3, mouse.target, false);
  if (norm < 1) {
    if (clickerOption.track && clickerOption.queue.length > 0) {
      const Q = clickerOption.queue.shift();
      if (Q instanceof THREE.Vector3) {
        const newAngle = Math.atan2(Q.z - currentPos.z, Q.x - currentPos.x);
        calcProp.setMouseInput?.({ target: Q, angle: newAngle });
      } else if (Q?.action === 'stop') {
        const { beforeCB, afterCB, time } = Q;
        if (calcProp.state) {
          calcProp.state.clock.stop();
          beforeCB(calcProp.state);
          setTimeout(() => {
            if (calcProp.state) {
              calcProp.state.clock.start();
              afterCB(calcProp.state);
            }
          }, time);
        }
      }
      if (clickerOption.loop && Q) clickerOption.queue.push(Q);
    } else {
      calcProp.setMouseInput?.({ isActive: false, shouldRun: false });
    }
  }
}

export function direction(physicsState: PhysicsState, controlMode?: string, calcProp?: calcType) {
  const { activeState, keyboard, mouse, characterConfig } = physicsState;
  if (mouse.isActive) {
    mouseDirection(activeState, mouse, characterConfig);
  } else {
    keyboardDirection(activeState, keyboard, characterConfig, controlMode);
  }
  if (calcProp) {
    handleClickerQueue(calcProp);
  }
}

function mouseDirection(
  activeState: ActiveStateType,
  mouse: PhysicsState['mouse'],
  characterConfig: PhysicsState['characterConfig'],
) {
  const { turnSpeed = 10 } = characterConfig;
  const targetAngle = Math.PI / 2 - mouse.angle;
  let angleDiff = targetAngle - activeState.euler.y;
  while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
  const rotationSpeed = (turnSpeed * Math.PI) / 80;
  const rotationStep = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed);
  activeState.euler.y += rotationStep;
  const start = 1;
  const front = V3(start, 0, start);
  activeState.direction = front.multiply(
    V3(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y)),
  );
  activeState.dir = activeState.direction.normalize();
}

function keyboardDirection(
  activeState: ActiveStateType,
  keyboard: PhysicsState['keyboard'],
  characterConfig: PhysicsState['characterConfig'],
  controlMode?: string,
) {
  const { forward, backward, leftward, rightward } = keyboard;
  const { turnSpeed = 10 } = characterConfig;
  const dirX = Number(leftward) - Number(rightward);
  const dirZ = Number(forward) - Number(backward);
  if (dirX === 0 && dirZ === 0) return;

  if (controlMode === 'thirdPersonOrbit' || controlMode === 'orbit') {
    const orbitRotationSpeed = (turnSpeed * Math.PI) / 320;
    activeState.euler.y += dirX * orbitRotationSpeed;
    const start = dirZ;
    const front = V3(start, 0, start);
    activeState.direction = front.multiply(
      V3(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y)),
    );
    activeState.dir = activeState.direction.normalize();
  } else {
    const dir = V3(dirX, 0, dirZ);
    const targetAngle = calcAngleByVector(dir);
    let angleDiff = targetAngle - activeState.euler.y;
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    const rotationSpeed = (turnSpeed * Math.PI) / 160;
    const rotationStep = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed);
    activeState.euler.y += rotationStep;
    activeState.dir.set(dirX, 0, dirZ);
    activeState.direction = activeState.dir.clone();
  }
}
