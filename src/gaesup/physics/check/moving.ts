import { gameStore } from '../../store/gameStore';
import { PhysicsCalcProps } from '../types';
let isCurrentlyJumping = false;
let lastMovingState = false;
let lastRunningState = false;

export default function moving(prop: PhysicsCalcProps) {
  // gameStore에서 직접 상태 가져오기
  const keyboard = gameStore.input.keyboard;
  const mouse = gameStore.input.pointer;
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

  if (space && !isCurrentlyJumping) {
    isCurrentlyJumping = true;
    // gameStore 직접 업데이트
    gameStore.gameStates.isJumping = true;
  }

  if (lastMovingState !== isMoving || lastRunningState !== isRunning) {
    lastMovingState = isMoving;
    lastRunningState = isRunning;
    // gameStore 직접 업데이트
    gameStore.gameStates.isMoving = isMoving;
    gameStore.gameStates.isRunning = isRunning;
    gameStore.gameStates.isNotMoving = !isMoving;
  }
}

export function resetJumpState() {
  isCurrentlyJumping = false;
}
