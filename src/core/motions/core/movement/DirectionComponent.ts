
import * as THREE from 'three';

import { Profile, HandleError } from '@/core/boilerplate/decorators';
import type { RefObject } from '@core/boilerplate';
import { PhysicsConfigType } from '@stores/slices';
import { ModeType } from '@stores/slices/mode/types';
import {
  getCachedTrig,
  MemoizationManager,
  shouldUpdate
} from '@utils/memoization';
import { calcAngleByVector, calcNorm } from '@utils/vector';

import { InteractionSystem } from '../../../interactions/core/InteractionSystem';
import { ActiveStateType } from '../../core/types';
import {
  PhysicsCalcProps,
  PhysicsState,
} from '../../types';


export class DirectionComponent {
  private memoManager = MemoizationManager.getInstance();
  private vectorCache = this.memoManager.getVectorCache('direction');
  private lastEulerY = { character: 0, vehicle: 0, airplane: 0 };
  private lastDirectionLength = 0;
  private lastKeyboardState = {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
  };
  private timers = new Set<NodeJS.Timeout>();
  private interactionSystem: InteractionSystem;
  private config: PhysicsConfigType;
  private tempEuler = new THREE.Euler();
  private tempQuaternion = new THREE.Quaternion();
  private targetQuaternion = new THREE.Quaternion();

  constructor(config: PhysicsConfigType) {
    this.interactionSystem = InteractionSystem.getInstance();
    this.config = config;
  }

  @Profile()
  updateDirection(
    physicsState: PhysicsState,
    controlMode?: string,
    calcProp?: PhysicsCalcProps,
    innerGroupRef?: RefObject<THREE.Group>,
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
        this.updateAirplaneDirection(physicsState, innerGroupRef, controlMode);
        break;
      default:
        this.updateCharacterDirection(physicsState, controlMode, calcProp);
    }
  }

  @Profile()
  private updateCharacterDirection(
    physicsState: PhysicsState,
    controlMode?: string,
    calcProp?: PhysicsCalcProps,
  ): void {
    const { activeState } = physicsState;
    const keyboard = this.interactionSystem.getKeyboardRef();
    const mouse = this.interactionSystem.getMouseRef();
    const keyboardChanged =
      this.lastKeyboardState.forward !== keyboard.forward ||
      this.lastKeyboardState.backward !== keyboard.backward ||
      this.lastKeyboardState.leftward !== keyboard.leftward ||
      this.lastKeyboardState.rightward !== keyboard.rightward;
    if (mouse.isActive) {
      this.handleMouseDirection(activeState, mouse, this.config, calcProp);
    } else if (keyboardChanged) {
      const hasKeyboardInput =
        keyboard.forward || keyboard.backward || keyboard.leftward || keyboard.rightward;
      if (hasKeyboardInput) {
        this.handleKeyboardDirection(activeState, keyboard, this.config, controlMode);
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

  @Profile()
  private updateVehicleDirection(
    physicsState: PhysicsState,
    controlMode?: string
  ): void {
    void controlMode;
    const { activeState } = physicsState;
    const keyboard = this.interactionSystem.getKeyboardRef();
    const { forward, backward, leftward, rightward } = keyboard;
    const xAxis = Number(rightward) - Number(leftward);
    const zAxis = Number(backward) - Number(forward);

    activeState.euler.y += xAxis * (Math.PI / 64);

    const { sin: sinY, cos: cosY } = getCachedTrig(activeState.euler.y);
    activeState.direction.set(sinY * zAxis, 0, cosY * zAxis);
    activeState.dir.copy(activeState.direction);

    this.emitRotationUpdate(activeState, 'vehicle');
  }

  @Profile()
  private updateAirplaneDirection(
    physicsState: PhysicsState,
    innerGroupRef?: RefObject<THREE.Group>,
    controlMode?: string,
  ): void {
    const { activeState } = physicsState;
    const keyboard = this.interactionSystem.getKeyboardRef();
    const { forward, backward, leftward, rightward, shift, space } = keyboard;
    const {
      angleDelta = { x: 0.02, y: 0.02, z: 0.02 },
      maxAngle = { x: Math.PI / 6, y: Math.PI, z: Math.PI / 6 },
      accelRatio = 1.5,
    } = this.config || {};
    if (!innerGroupRef?.current) return;
    let boost = 1;
    if (shift) boost *= accelRatio;
    if (space) boost *= 1.5;
    const upDown = Number(forward) - Number(backward);
    const leftRight = Number(leftward) - Number(rightward);
    if (controlMode === 'chase') {
      activeState.euler.y += leftRight * angleDelta.y * 0.5;
    } else {
      activeState.euler.y += leftRight * angleDelta.y;
    }
    this.applyAirplaneRotation(innerGroupRef.current, upDown, leftRight, maxAngle, activeState);
    activeState.direction.set(
      Math.sin(activeState.euler.y) * boost,
      -upDown * boost,
      Math.cos(activeState.euler.y) * boost,
    );
    activeState.dir.copy(activeState.direction).normalize();
    this.emitRotationUpdate(activeState, 'airplane');
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
    
    // Hot path: avoid object-pool overhead by reusing per-instance scratch objects.
    this.tempEuler.set(targetX, 0, targetZ);
    this.tempQuaternion.setFromEuler(innerGroup.rotation);
    this.targetQuaternion.setFromEuler(this.tempEuler);
    this.tempQuaternion.slerp(this.targetQuaternion, 0.2);
    innerGroup.setRotationFromQuaternion(this.tempQuaternion);
  }

  private handleMouseDirection(
    activeState: ActiveStateType,
    mouse: PhysicsState['mouse'],
    characterConfig: PhysicsConfigType,
    calcProp?: PhysicsCalcProps,
  ): void {
    const { automation } = calcProp?.worldContext || {};
    if (automation?.settings.trackProgress && automation.queue.actions && automation.queue.actions.length > 0) {
      const Q = automation.queue.actions.shift();
      if (Q && Q.target) {
        const currentPosition = this.vectorCache.getTempVector(2);
        const rb = calcProp?.rigidBodyRef?.current;
        if (rb) {
          const t = rb.translation();
          currentPosition.set(t.x, t.y, t.z);
        } else {
          currentPosition.set(0, 0, 0);
        }
        const targetPosition = Q.target;
        const direction = this.vectorCache.getTempVector(1);
        direction.subVectors(targetPosition, currentPosition).normalize();
        if (calcProp?.memo) {
          if (!calcProp.memo.direction) {
            calcProp.memo.direction = new THREE.Vector3();
          }
          if (!calcProp.memo.directionTarget) {
            calcProp.memo.directionTarget = new THREE.Vector3();
          }
          calcProp.memo.direction.copy(direction);
          calcProp.memo.directionTarget.copy(targetPosition);
        }
        
        if (automation.queue.loop && Q && automation.queue.actions) {
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

  private handleClicker(calcProp: PhysicsCalcProps, currentPos: { x: number; y: number; z: number }): void {
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
          const timer = setTimeout(() => {
            if (calcProp.state) {
              calcProp.state.clock.start();
            }
            this.timers.delete(timer);
          }, duration);
          this.timers.add(timer);
        }
      }
      if (automation.queue.loop && Q && automation.queue.actions) {
        automation.queue.actions.push(Q);
      }
    } else {
      calcProp.setMouseInput?.({ isActive: false, shouldRun: false });
    }
  }

  private applyMouseRotation(
    activeState: ActiveStateType,
    mouse: PhysicsState['mouse'],
    characterConfig: PhysicsConfigType,
  ): void {
    void characterConfig;
    activeState.euler.y = Math.PI / 2 - mouse.angle;
    const { sin: sinY, cos: cosY } = getCachedTrig(activeState.euler.y);
    activeState.dir.set(-sinY, 0, -cosY);
    activeState.direction.copy(activeState.dir);
  }

  private handleKeyboardDirection(
    activeState: ActiveStateType,
    keyboard: PhysicsState['keyboard'],
    characterConfig: PhysicsConfigType,
    controlMode?: string,
  ): void {
    void characterConfig;
    void controlMode;
    const { forward, backward, leftward, rightward } = keyboard;
    const dirX = Number(rightward) - Number(leftward);
    const dirZ = Number(backward) - Number(forward);
    if (dirX === 0 && dirZ === 0) return;
    // 원래의 간단한 로직으로 복원
    const tempVector3 = this.vectorCache.getTempVector(5);
    tempVector3.set(dirX, 0, dirZ);
    const angle = calcAngleByVector(tempVector3);
    activeState.euler.y = angle;
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
      this.lastDirectionLength = currentDirectionLength;
    }
    this.lastEulerY[entityType] = activeState.euler.y;
  }

  @HandleError()
  dispose(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}
