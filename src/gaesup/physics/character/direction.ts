import * as THREE from 'three';
import { ActiveStateType } from '../../types';
import { calcAngleByVector, calcNorm } from '../../utils/vector';
import { physicsEventBus } from '../stores/physicsEventBus';
import { PhysicsCalcProps, PhysicsState } from '../types';

const _tempVector3 = new THREE.Vector3();
const _tempDirection = new THREE.Vector3();
const _tempFront = new THREE.Vector3();
const _tempCurrentPos = new THREE.Vector3();

export function direction(
  physicsState: PhysicsState,
  controlMode?: string,
  calcProp?: PhysicsCalcProps,
) {
  const { activeState, keyboard, mouse, characterConfig } = physicsState;
  if (mouse.isActive) {
    mouseDirection(activeState, mouse, characterConfig, calcProp);
  } else {
    keyboardDirection(activeState, keyboard, characterConfig, controlMode);
  }

  // 방향이 변경되었으면 ROTATION_UPDATE 이벤트 발행
  physicsEventBus.emit('ROTATION_UPDATE', {
    euler: activeState.euler,
    direction: activeState.direction,
    dir: activeState.dir,
  });
}

function mouseDirection(
  activeState: ActiveStateType,
  mouse: PhysicsState['mouse'],
  characterConfig: PhysicsState['characterConfig'],
  calcProp?: PhysicsCalcProps,
) {
  if (calcProp?.rigidBodyRef.current) {
    const currentPos = calcProp.rigidBodyRef.current.translation();
    _tempCurrentPos.set(currentPos.x, currentPos.y, currentPos.z);
    const norm = calcNorm(_tempCurrentPos, mouse.target, false);
    if (norm < 1) {
      const { clickerOption } = calcProp.worldContext || {};
      if (clickerOption?.track && clickerOption.queue && clickerOption.queue.length > 0) {
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
        if (clickerOption.loop && Q && clickerOption.queue) {
          clickerOption.queue.push(Q);
        }
      } else {
        calcProp.setMouseInput?.({ isActive: false, shouldRun: false });
        return;
      }
    }
  }
  const { turnSpeed = 10 } = characterConfig;
  const targetAngle = Math.PI / 2 - mouse.angle;
  let angleDiff = targetAngle - activeState.euler.y;
  while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
  const rotationSpeed = (turnSpeed * Math.PI) / 80;
  const rotationStep = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed);
  activeState.euler.y += rotationStep;

  const sinY = -Math.sin(activeState.euler.y);
  const cosY = -Math.cos(activeState.euler.y);
  _tempFront.set(1, 0, 1);
  _tempDirection.set(sinY, 0, cosY);
  _tempFront.multiply(_tempDirection);
  activeState.direction.copy(_tempFront);
  activeState.dir.copy(_tempFront).normalize();
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

    const sinY = -Math.sin(activeState.euler.y);
    const cosY = -Math.cos(activeState.euler.y);
    _tempFront.set(dirZ, 0, dirZ);
    _tempDirection.set(sinY, 0, cosY);
    _tempFront.multiply(_tempDirection);
    activeState.direction.copy(_tempFront);
    activeState.dir.copy(_tempFront).normalize();
  } else {
    _tempVector3.set(dirX, 0, dirZ);
    const targetAngle = calcAngleByVector(_tempVector3);
    let angleDiff = targetAngle - activeState.euler.y;
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    const rotationSpeed = (turnSpeed * Math.PI) / 160;
    const rotationStep = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed);
    activeState.euler.y += rotationStep;
    activeState.dir.set(dirX, 0, dirZ);
    activeState.direction.copy(activeState.dir);
  }
}
