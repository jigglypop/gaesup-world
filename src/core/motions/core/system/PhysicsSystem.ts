import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import { RefObject } from 'react';
import { GravityComponent } from '../forces';
import { ForceComponent } from '../forces/ForceComponent';
import { AnimationController } from '../../controller/AnimationController';
import { PhysicsState, PhysicsCalcProps } from '../types';
import { GameStatesType } from '@core/world/components/Rideable/types';
import { PhysicsConfigType } from '@/core/stores/slices/mode copy/types';
import { AbstractSystem, SystemUpdateArgs } from '@core/boilerplate';
import { Profile, HandleError } from '@core/boilerplate';
import { DirectionComponent, ImpulseComponent } from '../movement';
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

export interface PhysicsUpdateArgs extends SystemUpdateArgs {
  calcProp: PhysicsCalcProps;
  physicsState: PhysicsState;
}

export class PhysicsSystem extends AbstractSystem<PhysicsSystemState, PhysicsSystemMetrics, PhysicsSystemOptions, PhysicsUpdateArgs> {
  private directionComponent: DirectionComponent;
  private impulseComponent: ImpulseComponent;
  private gravityComponent: GravityComponent;
  private animationController = new AnimationController();
  private forceComponents: ForceComponent[] = [];

  private keyStateCache = new Map<string, { lastKeyE: boolean; lastKeyR: boolean }>();
  private isCurrentlyJumping = false;
  private lastMovingState = false;
  private lastRunningState = false;

  private tempQuaternion = new THREE.Quaternion();
  private tempEuler = new THREE.Euler();
  private config: PhysicsConfigType;

  constructor(config: PhysicsConfigType, options: PhysicsSystemOptions = {}) {
    super(defaultState, defaultMetrics, options);
    this.config = config;
    this.directionComponent = new DirectionComponent(this.config);
    this.impulseComponent = new ImpulseComponent(this.config);
    this.gravityComponent = new GravityComponent(this.config);
  }

  @HandleError()
  public updateConfig(newConfig: Partial<PhysicsConfigType>) {
    this.config = { ...this.config, ...newConfig };
  }

  @Profile()
  protected performUpdate(args: PhysicsUpdateArgs): void {
    this.calculate(args.calcProp, args.physicsState);
  }

  @Profile()
  protected override updateMetrics(deltaTime: number): void {
    this.state.isJumping = this.isCurrentlyJumping;
    this.state.isMoving = this.lastMovingState;
    this.state.isRunning = this.lastRunningState;
  }

  @HandleError()
  @Profile()
  calculate(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    if (!physicsState || !calcProp.rigidBodyRef.current) return;
    const currentVelocity = calcProp.rigidBodyRef.current.linvel();
    const activeStateRef = physicsState.activeState;
    activeStateRef.velocity.set(
      currentVelocity.x,
      currentVelocity.y,
      currentVelocity.z
    );
    this.checkAllStates(calcProp, physicsState);
    this.animationController.update(physicsState.gameStates);
    const { modeType = 'character' } = physicsState;
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

  @Profile()
  private checkAllStates(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    const instanceId = `physics-${calcProp.rigidBodyRef.current?.handle || 'unknown'}`;
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
    const groundCheckDistance = 1.0;
    const isNearGround = position.y <= groundCheckDistance;
    const isNotFalling = Math.abs(velocity.y) < 0.5;
    const isOnTheGround = isNearGround && isNotFalling;
    const isFalling = !isOnTheGround && velocity.y < -0.1;
    if (isOnTheGround) {
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
    const isRunning = (isKeyboardMoving && shift) || (mouse.isActive && mouse.shouldRun);
    
    if (space && !this.isCurrentlyJumping) {
      this.isCurrentlyJumping = true;
      gameStatesRef.isJumping = true;
    }
    
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

  private checkRiding(instanceId: string = 'default', physicsState: PhysicsState): void {
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
    this.impulseComponent.applyImpulse(rigidBodyRef, physicsState);
    this.gravityComponent.applyGravity(rigidBodyRef, physicsState);
    this.updateForces(rigidBodyRef, physicsState.delta ?? 0);
    if (rigidBodyRef?.current) {
      const gameStatesRef = physicsState.gameStates;
      const activeStateRef = physicsState.activeState;
      const { isJumping, isFalling, isNotMoving } = gameStatesRef;
      const {
        linearDamping,
        airDamping,
        stopDamping,
      } = this.config;
      rigidBodyRef.current.setLinearDamping(
        isJumping || isFalling
          ? airDamping
          : isNotMoving
          ? linearDamping * stopDamping
          : linearDamping
      );
      rigidBodyRef.current.setEnabledRotations(false, false, false, false);
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
    this.impulseComponent.applyImpulse(rigidBodyRef, physicsState);
    this.applyDamping(rigidBodyRef, physicsState);
    this.updateForces(rigidBodyRef, physicsState.delta ?? 0);

    if (rigidBodyRef?.current) {
      const activeStateRef = physicsState.activeState;
      rigidBodyRef.current.setEnabledRotations(false, true, false, false);
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
    const { rigidBodyRef, innerGroupRef, matchSizes } = calcProp;
    this.directionComponent.updateDirection(
      physicsState,
      'normal',
      calcProp,
      innerGroupRef,
      matchSizes
    );
    this.impulseComponent.applyImpulse(rigidBodyRef, physicsState);
    this.gravityComponent.applyGravity(rigidBodyRef, physicsState);
    this.applyDamping(rigidBodyRef, physicsState);
    this.updateForces(rigidBodyRef, physicsState.delta ?? 0);
    if (rigidBodyRef?.current) {
      rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }

  @Profile()
  private applyDamping(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: PhysicsState): void {
    if (!rigidBodyRef?.current || !physicsState) return;
    const { modeType, keyboard } = physicsState;
    const { space } = keyboard;
    
    if (modeType === 'vehicle') {
      const { linearDamping, brakeRatio } = this.config;
      const damping = space ? brakeRatio : linearDamping;
      rigidBodyRef.current.setLinearDamping(damping);
    } else if (modeType === 'airplane') {
      const { linearDamping } = this.config;
      rigidBodyRef.current.setLinearDamping(linearDamping);
    }
  }

  public addForceComponent(component: ForceComponent): void {
    this.forceComponents.push(component);
  }

  @HandleError()
  public applyForce(force: THREE.Vector3, rigidBody: RapierRigidBody): void {
    if (!rigidBody) return;
    const currentVel = rigidBody.linvel();
    const newVel = new THREE.Vector3(
      currentVel.x + force.x,
      currentVel.y + force.y,
      currentVel.z + force.z
    );
    rigidBody.setLinvel(newVel, true);
  }

  @HandleError()
  @Profile()
  public calculateMovement(
    input: { forward: boolean; backward: boolean; leftward: boolean; rightward: boolean; shift: boolean; space: boolean },
    config: PhysicsConfigType,
    gameStates: GameStatesType,
    deltaTime: number
  ): THREE.Vector3 {
    const movement = new THREE.Vector3();
    const speedMultiplier = input.shift ? 2 : 1;
    const targetSpeed = (config.maxSpeed ?? 10) * speedMultiplier;
    if (input.forward) movement.z -= 1;
    if (input.backward) movement.z += 1;
    if (input.leftward) movement.x -= 1;
    if (input.rightward) movement.x += 1;
    if (movement.length() > 0) {
      movement.normalize().multiplyScalar(targetSpeed * deltaTime);
      gameStates.isRunning = input.shift;
      gameStates.isNotRunning = !input.shift;
    }
    return movement;
  }

  @HandleError()
  public calculateJump(config: PhysicsConfigType, gameStates: GameStatesType, isGrounded: boolean): THREE.Vector3 {
    if (!isGrounded) return new THREE.Vector3();
    gameStates.isJumping = true;
    return new THREE.Vector3(0, config.jumpSpeed, 0);
  }

  @Profile()
  private updateForces(rigidBodyRef: RefObject<RapierRigidBody>, delta: number): void {
    if (!rigidBodyRef.current) return;
    for (const component of this.forceComponents) {
      component.update(rigidBodyRef.current, delta);
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