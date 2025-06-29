import * as THREE from 'three';
import { PhysicsState } from '../types';
import { useGaesupStore } from '@stores/gaesupStore';
import { PhysicsCalcProps } from '../core/types';
import { activeStateUpdater } from '@utils/index';

export class StateChecker {
  private keyStateCache = new Map<string, { lastKeyE: boolean; lastKeyR: boolean }>();
  private isCurrentlyJumping = false;
  private lastMovingState = false;
  private lastRunningState = false;

  checkAll(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    const instanceId = `physics-${calcProp.rigidBodyRef.current?.handle || 'unknown'}`;
    this.checkGround(calcProp);
    this.checkMoving(calcProp);
    this.checkRotate(calcProp, physicsState.activeState);
    this.checkRiding(calcProp, instanceId);
  }

  private checkGround(prop: PhysicsCalcProps): void {
    const { rigidBodyRef, matchSizes } = prop;
    if (!rigidBodyRef.current) {
      useGaesupStore.getState().setStates({
        isOnTheGround: false,
        isFalling: true,
      });
      return;
    }

    const velocity = rigidBodyRef.current.linvel();
    const position = rigidBodyRef.current.translation();
    let groundCheckDistance = 1.0;
    if (matchSizes && matchSizes.characterUrl) {
      const characterSize = matchSizes.characterUrl;
      groundCheckDistance = characterSize.y * 0.1;
    }

    const isNearGround = position.y <= groundCheckDistance;
    const isNotFalling = Math.abs(velocity.y) < 0.5;
    const isOnTheGround = isNearGround && isNotFalling;
    const isFalling = !isOnTheGround && velocity.y < -0.1;

    if (isOnTheGround) {
      this.resetJumpState();
    }

    useGaesupStore.getState().setStates({
      isOnTheGround,
      isFalling,
    });

    useGaesupStore.getState().updateState({
      activeState: {
        ...useGaesupStore.getState().activeState,
        position: new THREE.Vector3(position.x, position.y, position.z),
        velocity: new THREE.Vector3(velocity.x, velocity.y, velocity.z),
      },
    });
  }

  private checkMoving(prop: PhysicsCalcProps): void {
    const { inputRef } = prop;
    if (!inputRef || !inputRef.current) {
      return;
    }

    const keyboard = inputRef.current.keyboard;
    const mouse = inputRef.current.mouse;
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
      useGaesupStore.getState().setStates({
        isJumping: true,
        isOnTheGround: true,
      });
    }

    if (this.lastMovingState !== isMoving || this.lastRunningState !== isRunning) {
      this.lastMovingState = isMoving;
      this.lastRunningState = isRunning;
      useGaesupStore.getState().setStates({
        isMoving,
        isRunning,
        isNotMoving: !isMoving,
        isNotRunning: !isRunning,
      });
    }
  }

  private checkRotate(
    prop: PhysicsCalcProps,
    currentActiveState: { euler: THREE.Euler; isMoving?: boolean },
  ): void {
    const { outerGroupRef } = prop;
    if (!currentActiveState.isMoving || !outerGroupRef?.current) {
      return;
    }
  }

  private checkRiding(prop: PhysicsCalcProps, instanceId: string = 'default'): void {
    const { inputRef } = prop;
    if (!inputRef || !inputRef.current) {
      return;
    }

    if (!this.keyStateCache.has(instanceId)) {
      this.keyStateCache.set(instanceId, { lastKeyE: false, lastKeyR: false });
    }

    const keyState = this.keyStateCache.get(instanceId)!;
    const keyF = inputRef.current.keyboard.keyF;
    const states = useGaesupStore.getState().states;

    if (keyF && !keyState.lastKeyE) {
      if (states.canRide && !states.isRiding) {
        useGaesupStore.getState().setStates({
          shouldEnterRideable: true,
          shouldExitRideable: false,
        });
      } else if (states.isRiding) {
        useGaesupStore.getState().setStates({
          shouldEnterRideable: false,
          shouldExitRideable: true,
        });
      }
    }

    keyState.lastKeyE = keyF;
    keyState.lastKeyR = false;
  }

  private resetJumpState(): void {
    this.isCurrentlyJumping = false;
  }
}
