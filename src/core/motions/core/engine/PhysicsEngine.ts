import { PhysicsState } from '../../types';
import { PhysicsCalcProps } from '../types';
import { RapierRigidBody } from '@react-three/rapier';
import { RefObject } from 'react';
import * as THREE from 'three';
import { AnimationController } from '../../controller/AnimationController';
import {
  characterConfigType,
  vehicleConfigType,
  airplaneConfigType
} from '../../types';
import { StateEngine } from './StateEngine';
import { InteractionEngine } from '../../../interactions/core/InteractionEngine';
import { GravityComponent } from '../forces';
import { DirectionComponent, ImpulseComponent } from '../movement';

export interface PhysicsConfig {
  character: characterConfigType;
  vehicle: vehicleConfigType;
  airplane: airplaneConfigType;
}

export class PhysicsEngine {
  private directionComponent = new DirectionComponent();
  private impulseComponent = new ImpulseComponent();
  private gravityComponent = new GravityComponent();
  private animationController = new AnimationController();

  private keyStateCache = new Map<string, { lastKeyE: boolean; lastKeyR: boolean }>();
  private isCurrentlyJumping = false;
  private lastMovingState = false;
  private lastRunningState = false;

  private tempQuaternion = new THREE.Quaternion();
  private tempEuler = new THREE.Euler();
  private config: PhysicsConfig;
  private stateEngine: StateEngine;
  private interactionEngine: InteractionEngine;

  constructor(config?: Partial<PhysicsConfig>) {
    this.config = {
      character: { ...config?.character },
      vehicle: { ...config?.vehicle },
      airplane: { ...config?.airplane }
    };
    this.stateEngine = StateEngine.getInstance();
    this.interactionEngine = InteractionEngine.getInstance();
  }

  public updateConfig(newConfig: Partial<PhysicsConfig>) {
    this.config = {
      character: { ...this.config.character, ...newConfig.character },
      vehicle: { ...this.config.vehicle, ...newConfig.vehicle },
      airplane: { ...this.config.airplane, ...newConfig.airplane }
    };
  }

  calculate(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    if (!physicsState || !calcProp.rigidBodyRef.current) return;
    const currentVelocity = calcProp.rigidBodyRef.current.linvel();
    const activeStateRef = this.stateEngine.getActiveStateRef();
    activeStateRef.velocity.set(
      currentVelocity.x,
      currentVelocity.y,
      currentVelocity.z
    );
    physicsState.activeState = activeStateRef;
    physicsState.gameStates = this.stateEngine.getGameStatesRef();
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

  private checkAllStates(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    const instanceId = `physics-${calcProp.rigidBodyRef.current?.handle || 'unknown'}`;
    this.checkGround(calcProp);
    this.checkMoving();
    this.checkRiding(instanceId);
  }

  private checkGround(prop: PhysicsCalcProps): void {
    const { rigidBodyRef } = prop;
    const gameStatesRef = this.stateEngine.getGameStatesRef();
    const activeStateRef = this.stateEngine.getActiveStateRef();
    if (!rigidBodyRef.current) {
      gameStatesRef.isOnTheGround = false;
      gameStatesRef.isFalling = true;
      return;
    }
    const velocity = rigidBodyRef.current.linvel();
    const position = rigidBodyRef.current.translation();
    let groundCheckDistance = 1.0;
    const isNearGround = position.y <= groundCheckDistance;
    const isNotFalling = Math.abs(velocity.y) < 0.5;
    const isOnTheGround = isNearGround && isNotFalling;
    const isFalling = !isOnTheGround && velocity.y < -0.1;
    if (isOnTheGround) {
      this.resetJumpState();
    }
    gameStatesRef.isOnTheGround = isOnTheGround;
    gameStatesRef.isFalling = isFalling;
    activeStateRef.position.set(position.x, position.y, position.z);
    activeStateRef.velocity.set(velocity.x, velocity.y, velocity.z);
  }

  private checkMoving(): void {
    const gameStatesRef = this.stateEngine.getGameStatesRef();
    const keyboard = this.interactionEngine.getKeyboardRef();
    const mouse = this.interactionEngine.getMouseRef();
    const shift = keyboard.shift;
    const space = keyboard.space;
    const forward = keyboard.forward;
    const backward = keyboard.backward;
    const leftward = keyboard.leftward;
    const rightward = keyboard.rightward;
    const isClickerMoving = mouse.isActive;
    const clickerIsRun = mouse.shouldRun;
    const isKeyboardMoving = forward || backward || leftward || rightward;
    const isMoving = isKeyboardMoving || isClickerMoving;
    let isRunning = false;
    if (isKeyboardMoving && shift) {
      isRunning = true;
    } else if (isClickerMoving && clickerIsRun) {
      isRunning = true;
    }
    if (space && !this.isCurrentlyJumping) {
      this.isCurrentlyJumping = true;
      gameStatesRef.isJumping = true;
    }
    if (this.lastMovingState !== isMoving || this.lastRunningState !== isRunning) {
      this.lastMovingState = isMoving;
      this.lastRunningState = isRunning;
      gameStatesRef.isMoving = isMoving;
      gameStatesRef.isRunning = isRunning;
      gameStatesRef.isNotMoving = !isMoving;
      gameStatesRef.isNotRunning = !isRunning;
    }
  }

  private checkRiding(instanceId: string = 'default'): void {
    const keyboard = this.interactionEngine.getKeyboardRef();
    
    if (!this.keyStateCache.has(instanceId)) {
      this.keyStateCache.set(instanceId, { lastKeyE: false, lastKeyR: false });
    }

    const keyState = this.keyStateCache.get(instanceId)!;
    const keyF = keyboard.keyF;
    const gameStatesRef = this.stateEngine.getGameStatesRef();

    if (keyF && !keyState.lastKeyE) {
      if (gameStatesRef.canRide && !gameStatesRef.isRiding) {
      } else if (gameStatesRef.isRiding) {
      }
    }

    keyState.lastKeyE = keyF;
    keyState.lastKeyR = false;
  }

  private resetJumpState(): void {
    this.isCurrentlyJumping = false;
    const gameStatesRef = this.stateEngine.getGameStatesRef();
    gameStatesRef.isJumping = false;
  }

  private calculateCharacter(
    calcProp: PhysicsCalcProps,
    physicsState: PhysicsState
  ) {
    const { rigidBodyRef, innerGroupRef } = calcProp;
    this.directionComponent.updateDirection(physicsState, 'normal', calcProp);
    this.impulseComponent.applyImpulse(rigidBodyRef, physicsState);
    this.gravityComponent.applyGravity(rigidBodyRef, physicsState);
    if (rigidBodyRef?.current) {
      const gameStatesRef = this.stateEngine.getGameStatesRef();
      const activeStateRef = this.stateEngine.getActiveStateRef();
      const { isJumping, isFalling, isNotMoving } = gameStatesRef;
      const {
        linearDamping = 0.2,
        airDamping = 0.1,
        stopDamping = 2
      } = this.config.character;
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

  private calculateVehicle(
    calcProp: PhysicsCalcProps,
    physicsState: PhysicsState
  ) {
    const { rigidBodyRef, innerGroupRef } = calcProp;
    this.directionComponent.updateDirection(physicsState, 'normal', calcProp);
    this.impulseComponent.applyImpulse(rigidBodyRef, physicsState);
    this.applyDamping(rigidBodyRef, physicsState);

    if (rigidBodyRef?.current) {
      const activeStateRef = this.stateEngine.getActiveStateRef();
      rigidBodyRef.current.setEnabledRotations(false, true, false, false);
      this.tempEuler.set(0, activeStateRef.euler.y, 0);
      this.tempQuaternion.setFromEuler(this.tempEuler);
      rigidBodyRef.current.setRotation(this.tempQuaternion, true);
      if (innerGroupRef?.current) {
        innerGroupRef.current.rotation.y = 0;
      }
    }
  }

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
    if (rigidBodyRef?.current) {
      rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }

  private applyDamping(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: PhysicsState): void {
    if (!rigidBodyRef?.current || !physicsState) return;
    const { modeType, keyboard } = physicsState;
    const { space } = keyboard;
    
    if (modeType === 'vehicle') {
      const { linearDamping = 0.9, brakeRatio = 5 } = this.config.vehicle;
      const damping = space ? brakeRatio : linearDamping;
      rigidBodyRef.current.setLinearDamping(damping);
    } else if (modeType === 'airplane') {
      const damping = this.config.airplane?.linearDamping || 0.8;
      rigidBodyRef.current.setLinearDamping(damping);
    }
  }
}
