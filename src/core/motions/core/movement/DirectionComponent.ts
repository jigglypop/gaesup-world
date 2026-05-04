
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
import { calcNorm } from '@utils/vector';

import {
  createInteractionInputAdapter,
  type InputAdapter,
} from '../../../interactions/core';
import {
  consumeReachedClickNavigationWaypoint,
  getClickNavigationRoute,
  getClickNavigationSettings,
} from '../../../navigation/ClickNavigationRoute';
import { ActiveStateType } from '../../core/types';
import {
  PhysicsCalcProps,
  PhysicsInputState,
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
  private inputBackend: InputAdapter;
  private config: PhysicsConfigType;
  private tempEuler = new THREE.Euler();
  private tempQuaternion = new THREE.Quaternion();
  private targetQuaternion = new THREE.Quaternion();
  private cameraForward = new THREE.Vector3();
  private cameraRight = new THREE.Vector3();
  private desiredMovement = new THREE.Vector3();
  private readonly upAxis = new THREE.Vector3(0, 1, 0);

  constructor(
    config: PhysicsConfigType = {} as PhysicsConfigType,
    inputBackend: InputAdapter = createInteractionInputAdapter(),
  ) {
    this.inputBackend = inputBackend;
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
        this.updateVehicleDirection(physicsState, controlMode, calcProp);
        break;
      case 'airplane':
        this.updateAirplaneDirection(physicsState, innerGroupRef, controlMode, calcProp);
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
    const keyboard = this.getKeyboard(calcProp);
    const mouse = this.getMouse(calcProp);
    const keyboardChanged =
      this.lastKeyboardState.forward !== keyboard.forward ||
      this.lastKeyboardState.backward !== keyboard.backward ||
      this.lastKeyboardState.leftward !== keyboard.leftward ||
      this.lastKeyboardState.rightward !== keyboard.rightward;
    const hasKeyboardInput =
      keyboard.forward || keyboard.backward || keyboard.leftward || keyboard.rightward;
    if (mouse.isActive) {
      this.handleMouseDirection(activeState, mouse, this.config, calcProp);
    } else if (hasKeyboardInput) {
      this.handleKeyboardDirection(activeState, keyboard, this.config, controlMode, calcProp);
    }
    if (keyboardChanged || hasKeyboardInput) {
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
    controlMode?: string,
    calcProp?: PhysicsCalcProps,
  ): void {
    void controlMode;
    const { activeState } = physicsState;
    const keyboard = this.getKeyboard(calcProp);
    const { forward, backward, leftward, rightward } = keyboard;
    const xAxis = Number(rightward) - Number(leftward);
    const zAxis = Number(forward) - Number(backward);

    activeState.euler.y -= xAxis * (Math.PI / 64);

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
    calcProp?: PhysicsCalcProps,
  ): void {
    const { activeState } = physicsState;
    const keyboard = this.getKeyboard(calcProp);
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
    const upDown = Number(backward) - Number(forward);
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

  private getKeyboard(calcProp?: PhysicsCalcProps): PhysicsInputState['keyboard'] {
    return calcProp?.inputRef?.current?.keyboard ?? this.inputBackend.getKeyboard();
  }

  private getMouse(calcProp?: PhysicsCalcProps): PhysicsInputState['mouse'] {
    return calcProp?.inputRef?.current?.mouse ?? this.inputBackend.getMouse();
  }

  private applyAirplaneRotation(
    innerGroup: THREE.Group,
    upDown: number,
    leftRight: number,
    maxAngle: { x: number; y: number; z: number },
    activeState: ActiveStateType,
  ): void {
    const X = maxAngle.x * upDown;
    const Z = -maxAngle.z * leftRight;
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
    this.syncClickNavigationTarget(mouse, calcProp);

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

  private syncClickNavigationTarget(
    mouse: PhysicsState['mouse'],
    calcProp?: PhysicsCalcProps,
  ): void {
    if (getClickNavigationRoute().length === 0) return;

    const currentPosition = this.vectorCache.getTempVector(3);
    const rb = calcProp?.rigidBodyRef?.current;
    if (rb) {
      const translation = rb.translation();
      currentPosition.set(translation.x, translation.y, translation.z);
    } else {
      currentPosition.copy(calcProp?.inputRef.current.mouse.target ?? mouse.target);
    }

    const nextTarget = consumeReachedClickNavigationWaypoint(currentPosition);
    const { shouldRun } = getClickNavigationSettings();

    if (!nextTarget) {
      calcProp?.setMouseInput?.({ isActive: false, shouldRun: false });
      mouse.isActive = false;
      mouse.shouldRun = false;
      return;
    }

    const nextAngle = Math.atan2(nextTarget.z - currentPosition.z, nextTarget.x - currentPosition.x);
    calcProp?.setMouseInput?.({
      target: nextTarget,
      angle: nextAngle,
      position: new THREE.Vector2(nextTarget.x, nextTarget.z),
      isActive: true,
      shouldRun,
    } as Partial<PhysicsInputState['mouse']>);
    mouse.target = nextTarget;
    mouse.angle = nextAngle;
    mouse.isActive = true;
    mouse.shouldRun = shouldRun;
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
    calcProp?: PhysicsCalcProps,
  ): void {
    void characterConfig;
    void controlMode;
    const desiredMovement = this.resolveKeyboardMovementDirection(keyboard, calcProp);
    if (!desiredMovement) return;

    // Character visuals are model-offset by PI and impulse applies `-dir`,
    // so store the inverse of the desired world-space movement.
    activeState.dir.copy(desiredMovement).multiplyScalar(-1);
    activeState.euler.y = Math.atan2(desiredMovement.x, desiredMovement.z);
    activeState.direction.copy(activeState.dir);
  }

  private resolveKeyboardMovementDirection(
    keyboard: PhysicsState['keyboard'],
    calcProp?: PhysicsCalcProps,
  ): THREE.Vector3 | null {
    const forwardAxis = Number(keyboard.forward) - Number(keyboard.backward);
    const rightAxis = Number(keyboard.rightward) - Number(keyboard.leftward);
    if (forwardAxis === 0 && rightAxis === 0) {
      return null;
    }

    const desiredMovement = this.desiredMovement.set(0, 0, 0);
    const camera = calcProp?.state?.camera;
    if (camera) {
      camera.getWorldDirection(this.cameraForward);
      this.cameraForward.y = 0;
      if (this.cameraForward.lengthSq() > 0.000001) {
        this.cameraForward.normalize();
        this.cameraRight.crossVectors(this.cameraForward, this.upAxis).normalize();
        desiredMovement.addScaledVector(this.cameraForward, forwardAxis);
        desiredMovement.addScaledVector(this.cameraRight, rightAxis);
      }
    }

    if (desiredMovement.lengthSq() <= 0.000001) {
      desiredMovement.set(rightAxis, 0, -forwardAxis);
    }

    return desiredMovement.normalize();
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
