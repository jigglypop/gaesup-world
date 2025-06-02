import { calcType } from "../type";

export default function moving(prop: calcType) {
  const {
    worldContext: { states, mode, control, clicker, clickerOption },
  } = prop;
  const { shift, space, forward, backward, leftward, rightward } = control;
  
  // 점프는 지면에 있을 때만 가능하고, 이전 프레임에서 스페이스바가 눌리지 않았을 때만
  const wasJumpingLastFrame = states.isJumping;
  if (space && states.isOnTheGround && !wasJumpingLastFrame) {
    states.isJumping = true;
  } else if (!space) {
    // 스페이스바를 뗐을 때 점프 상태 리셋 (착지 후 다시 점프 가능)
    states.isJumping = false;
  }
  
  // 하이브리드 모드: 클리커와 키보드 입력을 모두 처리
  const isKeyboardMoving = forward || backward || leftward || rightward;
  const isClickerMoving = clicker.isOn;
  
  states.isMoving = isKeyboardMoving || isClickerMoving;
  states.isNotMoving = !states.isMoving;
  
  // 달리기: 키보드 이동 중 Shift 누르거나, 클리커 Run 모드
  states.isRunning = (shift && isKeyboardMoving) || (clicker.isRun && isClickerMoving && clickerOption.isRun);
}
