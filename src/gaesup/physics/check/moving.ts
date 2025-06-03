import { physicsEventBus } from '../stores/physicsEventBus';
import { calcType } from '../type';

// 점프 상태 추적용 변수
let isCurrentlyJumping = false;

export default function moving(prop: calcType) {
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

  // 점프 처리 - 이미 점프 중이 아닐 때만 점프 허용
  if (space && !isCurrentlyJumping) {
    isCurrentlyJumping = true;
    physicsEventBus.emit('JUMP_STATE_CHANGE', {
      isJumping: true,
      isOnTheGround: true,
    });
  }

  physicsEventBus.emit('MOVE_STATE_CHANGE', {
    isMoving,
    isRunning,
    isNotMoving: !isMoving,
    isNotRunning: !isRunning,
  });
}

// 지면에 닿았을 때 점프 상태 리셋을 위한 함수
export function resetJumpState() {
  isCurrentlyJumping = false;
}
