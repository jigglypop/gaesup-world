import * as THREE from 'three';
import { PhysicsState } from '../types';
import { PhysicsCalcProps } from '../core/types';
import { ActiveStateType } from '../core/types';
import { StateEngine } from '../core/StateEngine';

type CheckAllPhysicsState = Pick<PhysicsState, 'activeState'>;
type RotateActiveState = Pick<ActiveStateType, 'euler'> & { isMoving?: boolean };

export class StateChecker {
  private keyStateCache = new Map<string, { lastKeyE: boolean; lastKeyR: boolean }>();
  private isCurrentlyJumping = false;
  private lastMovingState = false;
  private lastRunningState = false;
  private stateEngine: StateEngine;

  constructor() {
    this.stateEngine = StateEngine.getInstance();
  }

  checkAll(calcProp: PhysicsCalcProps, physicsState: CheckAllPhysicsState): void {
    const instanceId = `physics-${calcProp.rigidBodyRef.current?.handle || 'unknown'}`;
    this.checkGround(calcProp);
    this.checkMoving(calcProp);
    this.checkRotate(calcProp, physicsState.activeState);
    this.checkRiding(calcProp, instanceId);
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

  private checkMoving(prop: PhysicsCalcProps): void {
    const { inputRef } = prop;
    if (!inputRef || !inputRef.current) {
      return;
    }
    const gameStatesRef = this.stateEngine.getGameStatesRef();
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

  private checkRotate(
    prop: PhysicsCalcProps,
    currentActiveState: RotateActiveState,
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
    const gameStatesRef = this.stateEngine.getGameStatesRef();

    if (keyF && !keyState.lastKeyE) {
      if (gameStatesRef.canRide && !gameStatesRef.isRiding) {
        // shouldEnterRideable와 shouldExitRideable는 gameStates에 없으므로 추가 필요
        // 또는 다른 방식으로 처리
      } else if (gameStatesRef.isRiding) {
        // shouldEnterRideable와 shouldExitRideable는 gameStates에 없으므로 추가 필요
        // 또는 다른 방식으로 처리
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
}
