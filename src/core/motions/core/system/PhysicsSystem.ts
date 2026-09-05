import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import type { RefObject } from '@core/boilerplate';
import { AbstractSystem, SystemContext, SystemUpdateArgs } from '@core/boilerplate';
import { HandleError, ManageRuntime, Profile } from '@core/boilerplate';
import { AnimationController } from '@core/motions/controller/AnimationController';
import { GameStatesType } from '@core/world/components/Rideable/types';

import type { PhysicsCalcProps, PhysicsState } from '../../types';
import type { PhysicsConfigType } from '../config';
import { GravityComponent } from '../forces';
import { ForceComponent } from '../forces/ForceComponent';
import { DirectionComponent, ImpulseComponent } from '../movement';
import { EntityStateManager } from './EntityStateManager';
import { PhysicsSystemState, PhysicsSystemMetrics, PhysicsSystemOptions } from './types';

const defaultState: PhysicsSystemState = {
  isJumping: false,
  isMoving: false,
  isRunning: false,
  lastUpdate: 0,
};

const defaultMetrics: PhysicsSystemMetrics = {
  forcesApplied: 0,
  dampingChanges: 0,
  frameTime: 0,
};

const WORLD_GROUND_Y_THRESHOLD = 0.75;
const GROUNDED_VERTICAL_SPEED = 0.25;
const GROUNDED_Y_DELTA = 0.025;
const GROUNDED_STABLE_FRAMES = 3;
const WALK_GROUNDED_VERTICAL_SPEED = 1.2;
const WALK_GROUNDED_Y_DELTA = 0.35;
const FALLING_VERTICAL_SPEED = -0.25;

function createOwnedPhysicsConfig(config: PhysicsConfigType): PhysicsConfigType {
  const ownedConfig = { ...config };
  if (config.angleDelta) {
    ownedConfig.angleDelta = new THREE.Vector3(
      config.angleDelta.x,
      config.angleDelta.y,
      config.angleDelta.z,
    );
  }
  if (config.maxAngle) {
    ownedConfig.maxAngle = new THREE.Vector3(
      config.maxAngle.x,
      config.maxAngle.y,
      config.maxAngle.z,
    );
  }
  return ownedConfig;
}

export interface PhysicsUpdateArgs extends SystemUpdateArgs {
  calcProp: PhysicsCalcProps;
  physicsState: PhysicsState;
}

function isPhysicsUpdateArgs(context: SystemContext | PhysicsUpdateArgs): context is PhysicsUpdateArgs {
  const candidate = context as Partial<PhysicsUpdateArgs>;
  return candidate.calcProp !== undefined && candidate.physicsState !== undefined;
}

@ManageRuntime({ autoStart: false })
export class PhysicsSystem extends AbstractSystem<PhysicsSystemState, PhysicsSystemMetrics, PhysicsSystemOptions, PhysicsUpdateArgs> {
  private directionComponent: DirectionComponent;
  private impulseComponent: ImpulseComponent;
  private gravityComponent: GravityComponent;
  private animationController = new AnimationController();
  private forceComponents: ForceComponent[] = [];

  private keyStateCache = new Map<number, { lastKeyE: boolean; lastKeyR: boolean }>();
  private isCurrentlyJumping = false;
  private lastJumpPressed = false;
  private lastMovingState = false;
  private lastRunningState = false;

  private lastPositionY = 0;
  private groundStableCount = 0;
  private lastGroundedY: number | null = null;
  private previousMode: PhysicsState['modeType'] | null = null;

  private tempQuaternion = new THREE.Quaternion();
  private tempEuler = new THREE.Euler();
  private tempVector = new THREE.Vector3();
  private jumpScratch = new THREE.Vector3();
  private readonly config: PhysicsConfigType;

  constructor(
    config: PhysicsConfigType,
    options: PhysicsSystemOptions = {},
    stateManager?: EntityStateManager,
  ) {
    super(defaultState, defaultMetrics, options);
    this.config = createOwnedPhysicsConfig(config);
    this.directionComponent = new DirectionComponent(this.config);
    this.impulseComponent = new ImpulseComponent(this.config, stateManager);
    this.gravityComponent = new GravityComponent(this.config);
  }

  @HandleError()
  public updateConfig(newConfig: Partial<PhysicsConfigType>): void {
    Object.assign(this.config, createOwnedPhysicsConfig(newConfig));
  }

  @Profile()
  protected performUpdate(args: PhysicsUpdateArgs): void {
    this.calculate(args.calcProp, args.physicsState);
  }

  protected createUpdateArgs(context: SystemContext): PhysicsUpdateArgs {
    if (isPhysicsUpdateArgs(context)) {
      return context;
    }
    throw new Error('PhysicsSystem requires updateWithArgs().');
  }

  @Profile()
  protected override updateMetrics(deltaTime: number): void {
    void deltaTime;
    this.state.isJumping = this.isCurrentlyJumping;
    this.state.isMoving = this.lastMovingState;
    this.state.isRunning = this.lastRunningState;
  }

  public updateWithArgs(args: PhysicsUpdateArgs): void {
    this.performUpdateWithArgs(args);
  }

  @HandleError()
  @Profile()
  calculate(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    if (!physicsState || !calcProp.rigidBodyRef.current) return;

    const modeType = physicsState.modeType ?? 'character';
    const didTransition = this.normalizeModeTransition(calcProp, physicsState, modeType);
    const isFocused = calcProp.worldContext?.cameraOption?.focus === true;
    if (isFocused) {
      this.freezeInput(physicsState);
      this.checkGround(calcProp, physicsState);
      if (didTransition) {
        this.applyModeRigidBodySettings(calcProp, physicsState, modeType);
      }
      this.animationController.update(physicsState.gameStates);
      return;
    }

    const currentVelocity = calcProp.rigidBodyRef.current.linvel();
    const activeStateRef = physicsState.activeState;
    activeStateRef.velocity.set(
      currentVelocity.x,
      currentVelocity.y,
      currentVelocity.z
    );
    this.checkAllStates(calcProp, physicsState);
    this.animationController.update(physicsState.gameStates);
    switch (modeType) {
      case 'character':
        this.calculateCharacter(calcProp, physicsState);
        break;
      case 'vehicle':
        this.calculateVehicle(calcProp, physicsState);
        break;
      case 'airplane':
        this.calculateAirplane(calcProp, physicsState);
        break;
    }
  }

  private normalizeModeTransition(
    calcProp: PhysicsCalcProps,
    physicsState: PhysicsState,
    modeType: PhysicsState['modeType'],
  ): boolean {
    const previousMode = this.previousMode;
    this.previousMode = modeType;
    if (previousMode === null || previousMode === modeType) return false;

    const activeState = physicsState.activeState;
    activeState.direction.set(0, 0, 0);
    activeState.dir.set(0, 0, 0);
    activeState.euler.x = 0;
    activeState.euler.z = 0;
    physicsState.gameStates.isJumping = false;
    this.isCurrentlyJumping = false;
    this.lastJumpPressed = physicsState.keyboard.space;

    const innerGroup = calcProp.innerGroupRef?.current;
    if (modeType === 'character') {
      this.tempQuaternion.identity();
      calcProp.rigidBodyRef.current?.setRotation(this.tempQuaternion, true);
      if (innerGroup) {
        innerGroup.quaternion.setFromEuler(activeState.euler);
      }
      return true;
    }

    innerGroup?.rotation.set(0, 0, 0);
    this.tempEuler.set(0, activeState.euler.y, 0);
    this.tempQuaternion.setFromEuler(this.tempEuler);
    calcProp.rigidBodyRef.current?.setRotation(this.tempQuaternion, true);
    return true;
  }

  @Profile()
  private applyModeRigidBodySettings(
    calcProp: PhysicsCalcProps,
    physicsState: PhysicsState,
    modeType: PhysicsState['modeType'],
  ): void {
    const rigidBody = calcProp.rigidBodyRef.current;
    if (!rigidBody) return;

    this.gravityComponent.applyGravity(calcProp.rigidBodyRef, physicsState);
    switch (modeType) {
      case 'character': {
        const { isJumping, isFalling, isNotMoving } = physicsState.gameStates;
        const {
          linearDamping = 0.9,
          airDamping = 0.2,
          stopDamping = 1,
        } = this.config;
        rigidBody.setLinearDamping(
          isJumping || isFalling
            ? airDamping
            : isNotMoving
            ? linearDamping * stopDamping
            : linearDamping,
        );
        rigidBody.setEnabledRotations(false, false, false, false);
        break;
      }
      case 'vehicle': {
        const { linearDamping = 0.9, brakeRatio = linearDamping } = this.config;
        rigidBody.setLinearDamping(physicsState.keyboard.space ? brakeRatio : linearDamping);
        rigidBody.setEnabledRotations(false, true, false, false);
        break;
      }
      case 'airplane': {
        const { linearDamping = 0.2 } = this.config;
        rigidBody.setLinearDamping(linearDamping);
        rigidBody.setEnabledRotations(false, false, false, false);
        break;
      }
    }
  }

  @Profile()
  private checkAllStates(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    // Use the numeric rigid-body handle to avoid per-frame string allocations.
    const instanceId = calcProp.rigidBodyRef.current?.handle ?? -1;
    this.checkGround(calcProp, physicsState);
    this.checkMoving(physicsState);
    this.checkRiding(instanceId, physicsState);
  }

  @Profile()
  private checkGround(prop: PhysicsCalcProps, physicsState: PhysicsState): void {
    const { rigidBodyRef } = prop;
    const gameStatesRef = physicsState.gameStates;
    const activeStateRef = physicsState.activeState;
    if (!rigidBodyRef.current) {
      gameStatesRef.isOnTheGround = false;
      gameStatesRef.isFalling = true;
      return;
    }
    const velocity = rigidBodyRef.current.linvel();
    const position = rigidBodyRef.current.translation();

    const verticalSpeed = Math.abs(velocity.y);
    const positionDeltaY = Math.abs(position.y - this.lastPositionY);
    const isRising = velocity.y > 0.02;
    const isNearWorldGround = position.y <= WORLD_GROUND_Y_THRESHOLD;
    const isNearKnownGround =
      this.lastGroundedY !== null &&
      Math.abs(position.y - this.lastGroundedY) <= WORLD_GROUND_Y_THRESHOLD;
    const canReuseStableGround = isNearWorldGround || isNearKnownGround;
    const isJumpIntent = gameStatesRef.isJumping || physicsState.keyboard.space;
    const isWalkingGroundJitter =
      isNearKnownGround &&
      !isJumpIntent &&
      verticalSpeed < WALK_GROUNDED_VERTICAL_SPEED &&
      positionDeltaY < WALK_GROUNDED_Y_DELTA;

    if (
      !isRising &&
      canReuseStableGround &&
      verticalSpeed < GROUNDED_VERTICAL_SPEED &&
      positionDeltaY < GROUNDED_Y_DELTA
    ) {
      this.groundStableCount = Math.min(this.groundStableCount + 1, 5);
    } else {
      this.groundStableCount = 0;
    }
    this.lastPositionY = position.y;

    const isNearGround = canReuseStableGround && !isRising && verticalSpeed < GROUNDED_VERTICAL_SPEED;
    const isOnTheGround =
      isNearGround ||
      isWalkingGroundJitter ||
      this.groundStableCount >= GROUNDED_STABLE_FRAMES;
    const isFalling = !isOnTheGround && velocity.y < FALLING_VERTICAL_SPEED;

    if (isOnTheGround) {
      this.lastGroundedY = position.y;
      this.resetJumpState(physicsState);
    }
    gameStatesRef.isOnTheGround = isOnTheGround;
    gameStatesRef.isFalling = isFalling;
    this.copyVector3(activeStateRef.position, position);
    this.copyVector3(activeStateRef.velocity, velocity);
  }

  @Profile()
  private checkMoving(physicsState: PhysicsState): void {
    const gameStatesRef = physicsState.gameStates;
    const keyboard = physicsState.keyboard;
    const mouse = physicsState.mouse;
    const { shift, space, forward, backward, leftward, rightward } = keyboard;
    const isKeyboardMoving = forward || backward || leftward || rightward;
    const isMoving = isKeyboardMoving || mouse.isActive;
    const isRunning =
      (isKeyboardMoving && shift && !mouse.isLookAround) ||
      (mouse.isActive && mouse.shouldRun);

    const shouldStartJump =
      physicsState.modeType === 'character' &&
      space &&
      !this.lastJumpPressed &&
      gameStatesRef.isOnTheGround &&
      !this.isCurrentlyJumping;

    if (shouldStartJump) {
      this.isCurrentlyJumping = true;
      gameStatesRef.isJumping = true;
    }
    this.lastJumpPressed = space;
    
    this.updateStateIfChanged('isMoving', isMoving, () => {
      this.lastMovingState = isMoving;
      gameStatesRef.isMoving = isMoving;
      gameStatesRef.isNotMoving = !isMoving;
    });
    
    this.updateStateIfChanged('isRunning', isRunning, () => {
      this.lastRunningState = isRunning;
      gameStatesRef.isRunning = isRunning;
      gameStatesRef.isNotRunning = !isRunning;
    });
  }

  private checkRiding(instanceId: number = -1, physicsState: PhysicsState): void {
    const keyboard = physicsState.keyboard;
    if (!this.keyStateCache.has(instanceId)) {
      this.keyStateCache.set(instanceId, { lastKeyE: false, lastKeyR: false });
    }
    const keyState = this.keyStateCache.get(instanceId)!;
    const keyE = keyboard.keyE;
    const gameStatesRef = physicsState.gameStates;
    if (keyE && !keyState.lastKeyE) {
      if (gameStatesRef.canRide && !gameStatesRef.isRiding) {
      } else if (gameStatesRef.isRiding) {
      }
    }
    keyState.lastKeyE = keyE;
    keyState.lastKeyR = false;
  }

  private freezeInput(physicsState: PhysicsState): void {
    const gs = physicsState.gameStates;
    gs.isMoving = false;
    gs.isNotMoving = true;
    gs.isRunning = false;
    gs.isNotRunning = true;
    gs.isJumping = false;
    this.isCurrentlyJumping = false;
    this.lastJumpPressed = physicsState.keyboard.space;
    this.lastMovingState = false;
    this.lastRunningState = false;
  }

  private resetJumpState(physicsState: PhysicsState): void {
    this.isCurrentlyJumping = false;
    physicsState.gameStates.isJumping = false;
  }

  @HandleError()
  @Profile()
  private calculateCharacter(
    calcProp: PhysicsCalcProps,
    physicsState: PhysicsState
  ) {
    const { rigidBodyRef, innerGroupRef } = calcProp;
    this.directionComponent.updateDirection(physicsState, 'normal', calcProp);
    this.impulseComponent.applyImpulse(rigidBodyRef, physicsState, calcProp);
    this.applyModeRigidBodySettings(calcProp, physicsState, 'character');
    this.updateForces(rigidBodyRef, physicsState.delta ?? 0);
    if (rigidBodyRef.current) {
      const activeStateRef = physicsState.activeState;
      if (innerGroupRef?.current) {
        innerGroupRef.current.quaternion.setFromEuler(activeStateRef.euler);
      }
    }
  }

  @HandleError()
  @Profile()
  private calculateVehicle(
    calcProp: PhysicsCalcProps,
    physicsState: PhysicsState
  ) {
    const { rigidBodyRef, innerGroupRef } = calcProp;
    this.directionComponent.updateDirection(physicsState, 'normal', calcProp);
    this.impulseComponent.applyImpulse(rigidBodyRef, physicsState, calcProp);
    this.applyModeRigidBodySettings(calcProp, physicsState, 'vehicle');
    this.updateForces(rigidBodyRef, physicsState.delta ?? 0);

    if (rigidBodyRef.current) {
      const activeStateRef = physicsState.activeState;
      this.tempEuler.set(0, activeStateRef.euler.y, 0);
      this.tempQuaternion.setFromEuler(this.tempEuler);
      rigidBodyRef.current.setRotation(this.tempQuaternion, true);
      if (innerGroupRef?.current) {
        innerGroupRef.current.rotation.y = 0;
      }
    }
  }

  @HandleError()
  @Profile()
  private calculateAirplane(
    calcProp: PhysicsCalcProps,
    physicsState: PhysicsState
  ) {
    const { rigidBodyRef, innerGroupRef } = calcProp;
    this.directionComponent.updateDirection(
      physicsState,
      'normal',
      calcProp,
      innerGroupRef
    );
    this.impulseComponent.applyImpulse(rigidBodyRef, physicsState, calcProp);
    this.applyModeRigidBodySettings(calcProp, physicsState, 'airplane');
    this.updateForces(rigidBodyRef, physicsState.delta ?? 0);
    if (rigidBodyRef.current) {
      const activeStateRef = physicsState.activeState;
      this.tempEuler.set(0, activeStateRef.euler.y, 0);
      this.tempQuaternion.setFromEuler(this.tempEuler);
      rigidBodyRef.current.setRotation(this.tempQuaternion, true);
    }
  }

  public addForceComponent(component: ForceComponent): void {
    this.forceComponents.push(component);
  }

  @HandleError()
  public applyForce(force: THREE.Vector3, rigidBody: RapierRigidBody): void {
    if (!rigidBody) return;
    const currentVel = rigidBody.linvel();
    // Hot path: avoid allocating a new Vector3 on every call.
    this.tempVector.set(
      currentVel.x + force.x,
      currentVel.y + force.y,
      currentVel.z + force.z
    );
    rigidBody.setLinvel(this.tempVector, true);
  }

  @HandleError()
  @Profile()
  public calculateMovement(
    input: {
      forward: boolean;
      backward: boolean;
      leftward: boolean;
      rightward: boolean;
      shift: boolean;
      space: boolean;
      isLookAround?: boolean;
    },
    config: PhysicsConfigType,
    gameStates: GameStatesType,
    deltaTime: number,
    out?: THREE.Vector3
  ): THREE.Vector3 {
    const movement = (out ?? new THREE.Vector3()).set(0, 0, 0);
    const isRunning = input.shift && !input.isLookAround;
    const speedMultiplier = isRunning ? 2 : 1;
    const targetSpeed = (config.maxSpeed ?? 10) * speedMultiplier;
    if (input.forward) movement.z += 1;
    if (input.backward) movement.z -= 1;
    if (input.leftward) movement.x += 1;
    if (input.rightward) movement.x -= 1;
    if (movement.length() > 0) {
      movement.normalize().multiplyScalar(targetSpeed * deltaTime);
      gameStates.isRunning = isRunning;
      gameStates.isNotRunning = !isRunning;
    }
    return movement;
  }

  @HandleError()
  public calculateJump(config: PhysicsConfigType, gameStates: GameStatesType, isGrounded: boolean): THREE.Vector3 {
    if (!isGrounded) return this.jumpScratch.set(0, 0, 0);
    gameStates.isJumping = true;
    return this.jumpScratch.set(0, config.jumpSpeed ?? 0, 0);
  }

  @Profile()
  private updateForces(rigidBodyRef: RefObject<RapierRigidBody>, delta: number): void {
    if (!rigidBodyRef.current || this.forceComponents.length === 0) return;
    const body = rigidBodyRef.current;
    for (let i = 0, len = this.forceComponents.length; i < len; i++) {
      const component = this.forceComponents[i];
      if (!component) continue;
      component.update(body, delta);
    }
  }

  /**
   * Vector3 헬퍼 - 한 벡터를 다른 벡터로 복사
   */
  private copyVector3<T extends { set: (x: number, y: number, z: number) => void }>(
    target: T, 
    source: { x: number; y: number; z: number }
  ): void {
    target.set(source.x, source.y, source.z);
  }

  protected override onDispose(): void {
    this.directionComponent.dispose();
    this.forceComponents = [];
    this.keyStateCache.clear();
    this.groundStableCount = 0;
    this.lastGroundedY = null;
    this.lastJumpPressed = false;
    this.previousMode = null;
  }

  /**
   * 조건부 상태 업데이트 - 변경된 경우에만 업데이트
   */
  private updateStateIfChanged<K extends keyof PhysicsSystemState>(
    key: K,
    newValue: PhysicsSystemState[K],
    callback?: () => void
  ): boolean {
    if (this.state[key] !== newValue) {
      this.state[key] = newValue;
      callback?.();
      return true;
    }
    return false;
  }
} 
