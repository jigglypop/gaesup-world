import { RefObject } from 'react';
import * as THREE from 'three';
import { ActiveStateType, ModeType } from '../../types';
import {
  getCachedTrig,
  MemoizationManager,
  normalizeAngle,
  shouldUpdate,
} from '../../utils/memoization';
import { calcAngleByVector, calcNorm } from '../../utils/vector';
import { PhysicsCalcProps, PhysicsState } from '../types';
import { useGaesupStore } from '@stores/gaesupStore';

export class DirectionController {
  private memoManager = MemoizationManager.getInstance();
  private vectorCache = this.memoManager.getVectorCache('direction');
  private tempEuler = new THREE.Euler();
  private tempQuaternion = new THREE.Quaternion();
  private targetQuaternion = new THREE.Quaternion();
  private lastEulerY = { character: 0, vehicle: 0, airplane: 0 };
  private lastDirectionLength = 0;
  private lastKeyboardState = {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
  };

  updateDirection(
    physicsState: PhysicsState,
    controlMode?: string,
    calcProp?: PhysicsCalcProps,
    innerGroupRef?: RefObject<THREE.Group>,
    matchSizes?: unknown,
  ): void {
    const { modeType } = physicsState;

    switch (modeType) {
      case 'character':
        this.updateCharacterDirection(physicsState, controlMode, calcProp);
        break;
      case 'vehicle':
        this.updateVehicleDirection(physicsState, controlMode);
        break;
      case 'airplane':
        this.updateAirplaneDirection(physicsState, innerGroupRef, matchSizes, controlMode);
        break;
      default:
        this.updateCharacterDirection(physicsState, controlMode, calcProp);
    }
  }

  private updateCharacterDirection(
    physicsState: PhysicsState,
    controlMode?: string,
    calcProp?: PhysicsCalcProps,
  ): void {
    const { activeState, keyboard, mouse, characterConfig } = physicsState;
    const keyboardChanged =
      this.lastKeyboardState.forward !== keyboard.forward ||
      this.lastKeyboardState.backward !== keyboard.backward ||
      this.lastKeyboardState.leftward !== keyboard.leftward ||
      this.lastKeyboardState.rightward !== keyboard.rightward;
    if (mouse.isActive) {
      this.handleMouseDirection(activeState, mouse, characterConfig, calcProp);
    } else if (keyboardChanged) {
      const hasKeyboardInput =
        keyboard.forward || keyboard.backward || keyboard.leftward || keyboard.rightward;
      if (hasKeyboardInput) {
        this.handleKeyboardDirection(activeState, keyboard, characterConfig, controlMode);
      }
      this.lastKeyboardState = {
        forward: keyboard.forward,
        backward: keyboard.backward,
        leftward: keyboard.leftward,
        rightward: keyboard.rightward,
      };
    }

    this.emitRotationUpdate(activeState, 'character');
  }

  private updateVehicleDirection(physicsState: PhysicsState, controlMode?: string): void {
    const { activeState, keyboard } = physicsState;
    const { forward, backward, leftward, rightward } = keyboard;
    const xAxis = Number(leftward) - Number(rightward);
    const zAxis = Number(forward) - Number(backward);

    if (xAxis !== 0) {
      if (controlMode === 'chase') {
        activeState.euler.y += xAxis * (Math.PI / 120);
      } else {
        activeState.euler.y += xAxis * (Math.PI / 64);
      }

      this.emitRotationUpdate(activeState, 'vehicle');
    }

    const { sin: sinY, cos: cosY } = getCachedTrig(activeState.euler.y);
    activeState.direction.set(sinY * zAxis, 0, cosY * zAxis);
    activeState.dir.copy(activeState.direction).normalize();
  }

  private updateAirplaneDirection(
    physicsState: PhysicsState,
    innerGroupRef?: RefObject<THREE.Group>,
    matchSizes?: unknown,
    controlMode?: string,
  ): void {
    const { activeState, keyboard, airplaneConfig } = physicsState;
    const { forward, backward, leftward, rightward, shift, space } = keyboard;
    const {
      angleDelta = { x: 0, y: 0, z: 0 },
      maxAngle = { x: 0, y: 0, z: 0 },
      accelRatio = 1,
    } = airplaneConfig || {};
    if (!innerGroupRef?.current) return;
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
    this.applyAirplaneRotation(innerGroupRef.current, upDown, leftRight, maxAngle, activeState);
    activeState.direction.set(
      Math.sin(activeState.euler.y) * boost,
      -upDown * boost,
      Math.cos(activeState.euler.y) * boost,
    );
    activeState.dir.copy(activeState.direction).normalize();
    useGaesupStore.getState().updateState({
      activeState: {
        ...useGaesupStore.getState().activeState,
        euler: activeState.euler,
        direction: activeState.direction,
        dir: activeState.dir,
      },
    });
  }

  private applyAirplaneRotation(
    innerGroup: THREE.Group,
    upDown: number,
    leftRight: number,
    maxAngle: { x: number; y: number; z: number },
    activeState: ActiveStateType,
  ): void {
    const X = maxAngle.x * upDown;
    const Z = maxAngle.z * leftRight;
    const _x = innerGroup.rotation.x;
    const _z = innerGroup.rotation.z;
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
    this.tempEuler.set(targetX, 0, targetZ);
    this.tempQuaternion.setFromEuler(innerGroup.rotation);
    this.targetQuaternion.setFromEuler(this.tempEuler);
    this.tempQuaternion.slerp(this.targetQuaternion, 0.2);
    innerGroup.setRotationFromQuaternion(this.tempQuaternion);
  }

  private handleMouseDirection(
    activeState: ActiveStateType,
    mouse: PhysicsState['mouse'],
    characterConfig: PhysicsState['characterConfig'],
    calcProp?: PhysicsCalcProps,
  ): void {
    const { automation } = calcProp.worldContext || {};
    if (automation?.settings.trackProgress && automation.queue.actions && automation.queue.actions.length > 0) {
      const Q = automation.queue.actions.shift();
      if (Q && Q.target) {
        const currentPosition = calcProp.body.translation();
        const targetPosition = Q.target;
        
        const direction = new THREE.Vector3()
          .subVectors(targetPosition, currentPosition)
          .normalize();
        
        calcProp.memo.direction = direction.clone();
        calcProp.memo.directionTarget = targetPosition.clone();
        
        if (automation.settings.loop && Q && automation.queue.actions) {
          automation.queue.actions.push(Q);
        }
      }
    } else {
      if (calcProp?.rigidBodyRef.current) {
        const currentPos = calcProp.rigidBodyRef.current.translation();
        const tempCurrentPos = this.vectorCache.getTempVector(0);
        tempCurrentPos.set(currentPos.x, currentPos.y, currentPos.z);
        const norm = calcNorm(tempCurrentPos, mouse.target, false);

        if (norm < 1) {
          this.handleClicker(calcProp, currentPos);
          return;
        }
      }

      this.applyMouseRotation(activeState, mouse, characterConfig);
    }
  }

  private handleClicker(calcProp: PhysicsCalcProps, currentPos: any): void {
    const { automation } = calcProp.worldContext || {};
    if (automation?.settings.trackProgress && automation.queue.actions && automation.queue.actions.length > 0) {
      const Q = automation.queue.actions.shift();
      if (Q && Q.target) {
        const newAngle = Math.atan2(Q.target.z - currentPos.z, Q.target.x - currentPos.x);
        calcProp.setMouseInput?.({ target: Q.target, angle: newAngle, isActive: true });
      } else if (Q && Q.type === 'wait') {
        const duration = Q.duration || 1000;
        if (calcProp.state) {
          calcProp.state.clock.stop();
          setTimeout(() => {
            if (calcProp.state) {
              calcProp.state.clock.start();
            }
          }, duration);
        }
      }
      if (automation.settings.loop && Q && automation.queue.actions) {
        automation.queue.actions.push(Q);
      }
    } else {
      calcProp.setMouseInput?.({ isActive: false, shouldRun: false });
    }
  }

  private applyMouseRotation(
    activeState: ActiveStateType,
    mouse: PhysicsState['mouse'],
    characterConfig: PhysicsState['characterConfig'],
  ): void {
    const { turnSpeed = 10 } = characterConfig;
    const targetAngle = Math.PI / 2 - mouse.angle;
    let angleDiff = normalizeAngle(targetAngle - activeState.euler.y);
    const rotationSpeed = (turnSpeed * Math.PI) / 80;
    const rotationStep = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed);
    activeState.euler.y += rotationStep;
    const { sin: sinY, cos: cosY } = getCachedTrig(activeState.euler.y);
    const tempDirection = this.vectorCache.getTempVector(2);
    tempDirection.set(-sinY, 0, -cosY);
    activeState.direction.copy(tempDirection);
    activeState.dir.copy(tempDirection).normalize();
  }

  private handleKeyboardDirection(
    activeState: ActiveStateType,
    keyboard: PhysicsState['keyboard'],
    characterConfig: PhysicsState['characterConfig'],
    controlMode?: string,
  ): void {
    const { forward, backward, leftward, rightward } = keyboard;
    const { turnSpeed = 10 } = characterConfig;
    const dirX = Number(leftward) - Number(rightward);
    const dirZ = Number(forward) - Number(backward);

    if (dirX === 0 && dirZ === 0) return;

    const tempVector3 = this.vectorCache.getTempVector(5);
    tempVector3.set(dirX, 0, dirZ);
    const targetAngle = calcAngleByVector(tempVector3);
    let angleDiff = normalizeAngle(targetAngle - activeState.euler.y);

    const rotationSpeed =
      controlMode === 'chase' ? (turnSpeed * Math.PI) / 160 : (turnSpeed * Math.PI) / 160;
    const rotationStep = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed);
    activeState.euler.y += rotationStep;

    activeState.dir.set(dirX, 0, dirZ);
    activeState.direction.copy(activeState.dir);
  }

  private emitRotationUpdate(
    activeState: ActiveStateType,
    entityType: ModeType,
  ): void {
    const currentDirectionLength = activeState.dir.length();
    const eulerChanged = shouldUpdate(activeState.euler.y, this.lastEulerY[entityType], 0.001);
    const directionChanged = shouldUpdate(currentDirectionLength, this.lastDirectionLength, 0.01);
    if (eulerChanged || directionChanged) {
      useGaesupStore.getState().updateState({
        activeState: {
          ...useGaesupStore.getState().activeState,
          euler: activeState.euler,
          direction: activeState.direction,
          dir: activeState.dir,
        },
      });
      this.lastEulerY[entityType] = activeState.euler.y;
      this.lastDirectionLength = currentDirectionLength;
    }
  }
}
