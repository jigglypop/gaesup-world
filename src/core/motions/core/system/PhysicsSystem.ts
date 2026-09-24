import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import type { RefObject } from '@core/boilerplate';
import { AbstractSystem, SystemContext, SystemUpdateArgs } from '@core/boilerplate/engine';
import { HandleError, Profile } from '@core/boilerplate/engine';
import { GameStatesType } from '@core/world/components/Rideable/types';

import type { ClickNavigationRoute } from '../../../navigation/ClickNavigationRoute';
import type { PhysicsCalcProps, PhysicsState } from '../../types';
import type { PhysicsConfigType } from '../config';
import { GravityComponent } from '../forces';
import { applyEnabledRotations, applyLinearDamping } from './bodySettings';
import { EntityStateManager } from './EntityStateManager';
import { GroundContactProbe } from './GroundContactProbe';
import { PhysicsSystemState, PhysicsSystemMetrics, PhysicsSystemOptions } from './types';
import type { InputAdapter } from '../../../input/core';
import type { NavigationSystem } from '../../../navigation/NavigationSystem';
import { ForceComponent } from '../forces/ForceComponent';
import { DirectionComponent, ImpulseComponent } from '../movement';

export type PhysicsWorldServices = { inputAdapter?: InputAdapter; navigation?: NavigationSystem; clickNavigation?: ClickNavigationRoute };

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

export type PhysicsUpdateStage = 'full' | 'drive';

export interface PhysicsUpdateArgs extends SystemUpdateArgs {
  calcProp: PhysicsCalcProps;
  physicsState: PhysicsState;
  stage?: PhysicsUpdateStage;
}

function isPhysicsUpdateArgs(context: SystemContext | PhysicsUpdateArgs): context is PhysicsUpdateArgs {
  const candidate = context as Partial<PhysicsUpdateArgs>;
  return candidate.calcProp !== undefined && candidate.physicsState !== undefined;
}

export class PhysicsSystem extends AbstractSystem<PhysicsSystemState, PhysicsSystemMetrics, PhysicsSystemOptions, PhysicsUpdateArgs> {
  private directionComponent: DirectionComponent;
  private impulseComponent: ImpulseComponent;
  private gravityComponent: GravityComponent;
  private forceComponents: ForceComponent[] = [];

  private isCurrentlyJumping = false;
  private lastJumpPressed = false;
  private lastMovingState = false;
  private lastRunningState = false;

  private readonly groundContact = new GroundContactProbe();
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
    services: PhysicsWorldServices = {},
  ) {
    super(defaultState, defaultMetrics, options);
    this.config = createOwnedPhysicsConfig(config);
    this.directionComponent = new DirectionComponent(this.config, services.inputAdapter, services.clickNavigation);
    this.impulseComponent = new ImpulseComponent(this.config, stateManager, services.inputAdapter, services.navigation);
    this.gravityComponent = new GravityComponent(this.config);
  }

  @HandleError()
  public updateConfig(newConfig: Partial<PhysicsConfigType>): void {
    Object.assign(this.config, createOwnedPhysicsConfig(newConfig));
  }

  @Profile()
  protected performUpdate(args: PhysicsUpdateArgs): void {
    if (args.stage === 'drive') {
      this.drive(args.calcProp, args.physicsState);
      return;
    }
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
    const didTransition = this.normalizeModeTransition(calcProp, physicsState);
    this.checkGround(calcProp, physicsState);
    this.applyDrive(calcProp, physicsState, didTransition);
  }

  @HandleError()
  drive(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    if (!physicsState || !calcProp.rigidBodyRef.current) return;
    const didTransition = this.normalizeModeTransition(calcProp, physicsState);
    this.applyDrive(calcProp, physicsState, didTransition);
  }

  @HandleError()
  resolve(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    if (!physicsState || !calcProp.rigidBodyRef.current) return;
    this.checkGround(calcProp, physicsState);
  }

  private applyDrive(
    calcProp: PhysicsCalcProps,
    physicsState: PhysicsState,
    didTransition: boolean,
  ): void {
    const modeType = physicsState.modeType ?? 'character';
    if (calcProp.worldContext?.cameraOption?.focus === true) {
      this.freezeInput(physicsState);
      if (didTransition) {
        this.applyModeRigidBodySettings(calcProp, physicsState, modeType);
      }
      return;
    }
    this.checkMoving(physicsState);
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

  private normalizeModeTransition(calcProp: PhysicsCalcProps, physicsState: PhysicsState): boolean {
    const modeType = physicsState.modeType ?? 'character';
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
        applyLinearDamping(rigidBody,
          isJumping || isFalling
            ? airDamping
            : isNotMoving
            ? linearDamping * stopDamping
            : linearDamping,
        );
        applyEnabledRotations(rigidBody, false, false, false);
        break;
      }
      case 'vehicle': {
        const { linearDamping = 0.9, brakeRatio = linearDamping } = this.config;
        applyLinearDamping(rigidBody, physicsState.keyboard.space ? brakeRatio : linearDamping);
        applyEnabledRotations(rigidBody, false, true, false);
        break;
      }
      case 'airplane': {
        const { linearDamping = 0.2 } = this.config;
        applyLinearDamping(rigidBody, linearDamping);
        applyEnabledRotations(rigidBody, false, false, false);
        break;
      }
    }
  }

  @Profile()
  private checkGround(prop: PhysicsCalcProps, physicsState: PhysicsState): void {
    const { rigidBodyRef } = prop;
    const gameStatesRef = physicsState.gameStates;
    const activeStateRef = physicsState.activeState;
    if (!rigidBodyRef.current) {
      gameStatesRef.isOnTheGround = false;
      activeStateRef.isGround = false;
      gameStatesRef.isFalling = true;
      return;
    }
    const velocity = rigidBodyRef.current.linvel();
    const position = rigidBodyRef.current.translation();
    const isOnTheGround = this.groundContact.read(prop.physicsWorld, rigidBodyRef.current, this.config, prop.groundContactFilter);
    const isFalling = !isOnTheGround && velocity.y < FALLING_VERTICAL_SPEED;

    if (isOnTheGround) {
      this.resetJumpState(physicsState);
    }
    gameStatesRef.isOnTheGround = isOnTheGround;
    activeStateRef.isGround = isOnTheGround;
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
    const isKeyboardMoving = forward || backward || leftward || rightward || !!(physicsState.gamepad?.connected && physicsState.gamepad.leftStick.lengthSq() > 0);
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
