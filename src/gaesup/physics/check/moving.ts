import { calcType } from "../type";

export default function moving(prop: calcType) {
  const {
    worldContext: { states, mode, control, clicker, clickerOption },
  } = prop;
  const { shift, space, forward, backward, leftward, rightward } = control;
  
  // 점프는 모든 컨트롤러 모드에서 작동
  states.isJumping = space;
  
  // 하이브리드 모드: 클리커와 키보드 입력을 모두 처리
  const isKeyboardMoving = forward || backward || leftward || rightward;
  const isClickerMoving = clicker.isOn;
  
  states.isMoving = isKeyboardMoving || isClickerMoving;
  states.isNotMoving = !states.isMoving;
  
  // 달리기: 키보드 이동 중 Shift 누르거나, 클리커 Run 모드
  states.isRunning = (shift && isKeyboardMoving) || (clicker.isRun && isClickerMoving && clickerOption.isRun);
}
