
import * as THREE from 'three';

import { Profile } from '@/core/boilerplate/decorators';
import type { RefObject } from '@core/boilerplate';
import { ModeType } from '@stores/slices/mode/types';
import {
  getCachedTrig,
  MemoizationManager,
  shouldUpdate
} from '@utils/memoization';
import { calcNorm } from '@utils/vector';

import { resolveMovementAxes } from '../../../input/movementAxes';
import {
  createInteractionInputAdapter,
  type InputAdapter,
} from '../../../interactions/core';
import { defaultClickNavigationRoute, type ClickNavigationRoute } from '../../../navigation/ClickNavigationRoute';
import { ActiveStateType } from '../../core/types';
import {
  PhysicsCalcProps,
  PhysicsInputState,
  PhysicsState,
} from '../../types';
import type { PhysicsConfigType } from '../config';

/** Steering constants are tuned per 60 Hz tick; other rates scale them by elapsed time. */
const REFERENCE_TICK_SECONDS = 1 / 60;
/** Bounds a single long stall so it cannot spin the vehicle by several ticks' worth at once. */
const MAX_TICK_SCALE = 4;
const AIRPLANE_TILT_BLEND_PER_TICK = 0.2;

export function steeringTickScale(delta: number | undefined): number {
  if (delta === undefined || !Number.isFinite(delta)) return 1;
  return Math.min(Math.max(delta / REFERENCE_TICK_SECONDS, 0), MAX_TICK_SCALE);
}

export class DirectionComponent {
  private memoManager = MemoizationManager.getInstance();
  private vectorCache = this.memoManager.getVectorCache('direction');
  private lastEulerY = { character: 0, vehicle: 0, airplane: 0 };
  private lastDirectionLength = 0;
  private inputBackend: InputAdapter;
  private config: PhysicsConfigType;
  private tempEuler = new THREE.Euler();
  private tempQuaternion = new THREE.Quaternion();
  private targetQuaternion = new THREE.Quaternion();
  private cameraForward = new THREE.Vector3();
  private cameraRight = new THREE.Vector3();
  private desiredMovement = new THREE.Vector3();
  private movementAxes = new THREE.Vector2();
  private readonly upAxis = new THREE.Vector3(0, 1, 0);

  constructor(
    config: PhysicsConfigType = {} as PhysicsConfigType,
    inputBackend: InputAdapter = createInteractionInputAdapter(),
    private readonly clickNavigation: ClickNavigationRoute = defaultClickNavigationRoute,
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
    if (mouse.isActive) {
      this.handleMouseDirection(activeState, mouse, this.config, calcProp);
    } else {
      this.handleKeyboardDirection(activeState, keyboard, this.config, controlMode, calcProp);
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
    const axes = this.getAxes(keyboard, calcProp, false);
    const xAxis = axes.x;
    const zAxis = axes.y;
    const scale = steeringTickScale(calcProp?.delta ?? physicsState.delta);

    activeState.euler.y -= xAxis * (Math.PI / 64) * scale;

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
    const { shift, space } = keyboard;
    const {
      angleDelta = { x: 0.02, y: 0.02, z: 0.02 },
      maxAngle = { x: Math.PI / 6, y: Math.PI, z: Math.PI / 6 },
      accelRatio = 1.5,
    } = this.config || {};
    if (!innerGroupRef?.current) return;
    let boost = 1;
    if (shift) boost *= accelRatio;
    if (space) boost *= 1.5;
    const axes = this.getAxes(keyboard, calcProp, false);
    const upDown = -axes.y;
    const leftRight = -axes.x;
    const scale = steeringTickScale(calcProp?.delta ?? physicsState.delta);
    if (controlMode === 'chase') {
      activeState.euler.y += leftRight * angleDelta.y * 0.5 * scale;
    } else {
      activeState.euler.y += leftRight * angleDelta.y * scale;
    }
    this.applyAirplaneRotation(innerGroupRef.current, upDown, leftRight, maxAngle, activeState, scale);
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

  private getAxes(keyboard: PhysicsState['keyboard'], calcProp?: PhysicsCalcProps, normalize = true): THREE.Vector2 {
    const gamepad = calcProp?.inputRef ? calcProp.inputRef.current.gamepad : this.inputBackend.getGamepad?.();
    return resolveMovementAxes(keyboard, gamepad, this.movementAxes, normalize);
  }

  private applyAirplaneRotation(
    innerGroup: THREE.Group,
    upDown: number,
    leftRight: number,
    maxAngle: { x: number; y: number; z: number },
    activeState: ActiveStateType,
    tickScale = 1,
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
    this.tempQuaternion.slerp(this.targetQuaternion, 1 - Math.pow(1 - AIRPLANE_TILT_BLEND_PER_TICK, tickScale));
    innerGroup.setRotationFromQuaternion(this.tempQuaternion);
  }

  private handleMouseDirection(
    activeState: ActiveStateType,
    mouse: PhysicsState['mouse'],
    characterConfig: PhysicsConfigType,
    calcProp?: PhysicsCalcProps,
  ): void {
    this.syncClickNavigationTarget(mouse, calcProp);

    if (!mouse.isActive) {
      activeState.dir.set(0, 0, 0);
      activeState.direction.set(0, 0, 0);
      return;
    }
    if (calcProp?.rigidBodyRef.current) {
      const currentPos = calcProp.rigidBodyRef.current.translation();
      const tempCurrentPos = this.vectorCache.getTempVector(0);
      tempCurrentPos.set(currentPos.x, currentPos.y, currentPos.z);
      if (this.clickNavigation.getClickNavigationRoute().length === 0 && calcNorm(tempCurrentPos, mouse.target, false) < 1) {
        calcProp.setMouseInput?.({ isActive: false, shouldRun: false, hasArrived: true });
        activeState.dir.set(0, 0, 0);
        activeState.direction.set(0, 0, 0);
        return;
      }
      mouse.angle = Math.atan2(mouse.target.z - currentPos.z, mouse.target.x - currentPos.x);
    }
    this.applyMouseRotation(activeState, mouse, characterConfig);
  }

  private syncClickNavigationTarget(
    mouse: PhysicsState['mouse'],
    calcProp?: PhysicsCalcProps,
  ): void {
    if (this.clickNavigation.getClickNavigationRoute().length === 0) return;

    const currentPosition = this.vectorCache.getTempVector(3);
    const rb = calcProp?.rigidBodyRef?.current;
    if (rb) {
      const translation = rb.translation();
      currentPosition.set(translation.x, translation.y, translation.z);
    } else {
      currentPosition.copy(calcProp?.inputRef.current.mouse.target ?? mouse.target);
    }

    const nextTarget = this.clickNavigation.consumeReachedClickNavigationWaypoint(currentPosition);
    const { shouldRun } = this.clickNavigation.getClickNavigationSettings();

    if (!nextTarget) {
      calcProp?.setMouseInput?.({ isActive: false, shouldRun: false, hasArrived: true });
      mouse.isActive = false;
      mouse.shouldRun = false;
      return;
    }

    const nextAngle = Math.atan2(nextTarget.z - currentPosition.z, nextTarget.x - currentPosition.x);
    if (
      mouse.isActive &&
      mouse.shouldRun === shouldRun &&
      mouse.angle === nextAngle &&
      mouse.target.equals(nextTarget)
    ) return;
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
    if (!desiredMovement) { activeState.dir.set(0, 0, 0); activeState.direction.set(0, 0, 0); return; }

    // Impulse applies -dir; visual yaw points the model's canonical +Z along
    // movement. Asset-facing corrections belong only to modelYawOffset.
    activeState.dir.copy(desiredMovement).multiplyScalar(-1);
    activeState.euler.y = Math.atan2(desiredMovement.x, desiredMovement.z);
    activeState.direction.copy(activeState.dir);
  }

  private resolveKeyboardMovementDirection(
    keyboard: PhysicsState['keyboard'],
    calcProp?: PhysicsCalcProps,
  ): THREE.Vector3 | null {
    const axes = this.getAxes(keyboard, calcProp);
    const forwardAxis = axes.y;
    const rightAxis = axes.x;
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

    return desiredMovement;
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

  dispose(): void {}
}
