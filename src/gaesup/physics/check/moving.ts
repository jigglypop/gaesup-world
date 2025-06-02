import { calcType } from "../type";

export default function moving(prop: calcType) {
  const {
    worldContext: { states, clickerOption },
    inputRef
  } = prop;
  
  // === ref 기반 시스템 사용 ===
  if (!inputRef || !inputRef.current) {
    // inputRef가 없으면 early return
    return;
  }
  
  const keyboard = inputRef.current.keyboard;
  const mouse = inputRef.current.mouse;
  
  // Keyboard 입력
  const shift = keyboard.shift;
  const space = keyboard.space;
  const forward = keyboard.forward;
  const backward = keyboard.backward;
  const leftward = keyboard.leftward;
  const rightward = keyboard.rightward;
  
  // Mouse/Clicker 입력
  const isClickerMoving = mouse.isActive;
  const clickerIsRun = mouse.shouldRun;
  const clickerOptionIsRun = clickerOption.isRun;
  
  // 점프는 지면에 있을 때만 가능하고, 이전 프레임에서 스페이스바가 눌리지 않았을 때만
  const wasJumpingLastFrame = states.isJumping;
  if (space && states.isOnTheGround && !wasJumpingLastFrame) {
    states.isJumping = true;
  } else if (!space) {
    // 스페이스바를 뗐을 때 점프 상태 리셋 (착지 후 다시 점프 가능)
    states.isJumping = false;
  }
  
  // 키보드와 클리커 입력을 모두 처리
  const isKeyboardMoving = forward || backward || leftward || rightward;
  
  states.isMoving = isKeyboardMoving || isClickerMoving;
  states.isNotMoving = !states.isMoving;
  
  // 달리기 판정 개선: 키보드 또는 클리커 중 하나라도 달리기 상태면 달리기
  if (isKeyboardMoving && shift) {
    // 키보드 이동 + Shift = 달리기
    states.isRunning = true;
  } else if (isClickerMoving && clickerIsRun && clickerOptionIsRun) {
    // 클리커 이동 + 클리커 달리기 옵션 = 달리기
    states.isRunning = true;
  } else {
    states.isRunning = false;
  }
  
  states.isNotRunning = !states.isRunning;
}
