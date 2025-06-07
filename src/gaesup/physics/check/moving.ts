import { eventBus } from '../stores';
import { PhysicsCalcProps } from '../types';
let isCurrentlyJumping = false;
let lastMovingState = false;
let lastRunningState = false;

export default function moving(prop: PhysicsCalcProps) {
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
  if (space && !isCurrentlyJumping) {
    isCurrentlyJumping = true;
    eventBus.emit('JUMP_STATE_CHANGE', {
      isJumping: true,
      isOnTheGround: true,
    });
  }
  if (lastMovingState !== isMoving || lastRunningState !== isRunning) {
    lastMovingState = isMoving;
    lastRunningState = isRunning;
    eventBus.emit('MOVE_STATE_CHANGE', {
      isMoving,
      isRunning,
      isNotMoving: !isMoving,
      isNotRunning: !isRunning,
    });
  }
}

export function resetJumpState() {
  isCurrentlyJumping = false;
}
