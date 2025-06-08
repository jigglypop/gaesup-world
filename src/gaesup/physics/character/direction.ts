import * as THREE from 'three';
import { ActiveStateType } from '../../types';
import {
  getCachedTrig,
  MemoizationManager,
  normalizeAngle,
  shouldUpdate,
} from '../../utils/memoization';
import { calcAngleByVector, calcNorm } from '../../utils/vector';
import { PhysicsCalcProps, PhysicsState } from '../types';
import { gameStore } from '../../store/gameStore';

const memoManager = MemoizationManager.getInstance();
const vectorCache = memoManager.getVectorCache('character-direction');
let lastEulerY = 0;
let lastDirectionLength = 0;
let lastKeyboardState = { forward: false, backward: false, leftward: false, rightward: false };

export function direction(
  physicsState: PhysicsState,
  controlMode?: string,
  calcProp?: PhysicsCalcProps,
) {
  const { activeState, keyboard, mouse, characterConfig } = physicsState;
  const hasKeyboardInput =
    keyboard.forward || keyboard.backward || keyboard.leftward || keyboard.rightward;
  const keyboardChanged =
    lastKeyboardState.forward !== keyboard.forward ||
    lastKeyboardState.backward !== keyboard.backward ||
    lastKeyboardState.leftward !== keyboard.leftward ||
    lastKeyboardState.rightward !== keyboard.rightward;

  if (mouse.isActive) {
    mouseDirection(activeState, mouse, characterConfig, calcProp);
  } else if (hasKeyboardInput || keyboardChanged) {
    keyboardDirection(activeState, keyboard, characterConfig, controlMode);
    lastKeyboardState = {
      forward: keyboard.forward,
      backward: keyboard.backward,
      leftward: keyboard.leftward,
      rightward: keyboard.rightward,
    };
  }
  const currentDirectionLength = activeState.dir.length();
  const eulerChanged = shouldUpdate(activeState.euler.y, lastEulerY, 0.001);
  const directionChanged = shouldUpdate(currentDirectionLength, lastDirectionLength, 0.01);
  if (eulerChanged || directionChanged) {
    // gameStore에 직접 업데이트
    Object.assign(gameStore.physics.activeState, {
      euler: activeState.euler,
      direction: activeState.direction,
      dir: activeState.dir,
    });
    lastEulerY = activeState.euler.y;
    lastDirectionLength = currentDirectionLength;
  }
}

function mouseDirection(
  activeState: ActiveStateType,
  mouse: PhysicsState['mouse'],
  characterConfig: PhysicsState['characterConfig'],
  calcProp?: PhysicsCalcProps,
) {
  if (calcProp?.rigidBodyRef.current) {
    const currentPos = calcProp.rigidBodyRef.current.translation();
    const tempCurrentPos = vectorCache.getTempVector(0);
    tempCurrentPos.set(currentPos.x, currentPos.y, currentPos.z);
    const norm = calcNorm(tempCurrentPos, mouse.target, false);
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
  let angleDiff = normalizeAngle(targetAngle - activeState.euler.y);
  const rotationSpeed = (turnSpeed * Math.PI) / 80;
  const rotationStep = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed);
  activeState.euler.y += rotationStep;
  const { sin: sinY, cos: cosY } = getCachedTrig(activeState.euler.y);
  const tempFront = vectorCache.getTempVector(1);
  const tempDirection = vectorCache.getTempVector(2);
  tempFront.set(1, 0, 1);
  tempDirection.set(-sinY, 0, -cosY);
  tempFront.multiply(tempDirection);
  activeState.direction.copy(tempFront);
  activeState.dir.copy(tempFront).normalize();
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

  if (controlMode === 'chase') {
    const tempVector3 = vectorCache.getTempVector(5);
    tempVector3.set(dirX, 0, dirZ);
    const targetAngle = calcAngleByVector(tempVector3);
    let angleDiff = normalizeAngle(targetAngle - activeState.euler.y);
    const rotationSpeed = (turnSpeed * Math.PI) / 160;
    const rotationStep = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed);
    activeState.euler.y += rotationStep;
    activeState.dir.set(dirX, 0, dirZ);
    activeState.direction.copy(activeState.dir);
  } else {
    // 임시 벡터 재사용
    const tempVector3 = vectorCache.getTempVector(5);
    tempVector3.set(dirX, 0, dirZ);

    const targetAngle = calcAngleByVector(tempVector3);

    // 각도 정규화와 차이 계산 최적화
    let angleDiff = normalizeAngle(targetAngle - activeState.euler.y);

    const rotationSpeed = (turnSpeed * Math.PI) / 160;
    const rotationStep = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed);
    activeState.euler.y += rotationStep;

    activeState.dir.set(dirX, 0, dirZ);
    activeState.direction.copy(activeState.dir);
  }
}
