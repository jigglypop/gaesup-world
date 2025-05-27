import { calcType } from "../type";

export default function moving(prop: calcType) {
  const {
    worldContext: { states, mode, control, clicker, clickerOption },
  } = prop;
  const { shift, space } = control;
  
  // 점프는 모든 컨트롤러 모드에서 작동
  states.isJumping = space;
  
  if (mode.controller === "clicker") {
    states.isMoving = clicker.isOn;
    states.isNotMoving = !clicker.isOn;
    states.isRunning =
      (shift || clicker.isRun) && states.isMoving && clickerOption.isRun;
  } else {
    // 키보드 모드에서의 이동 상태 설정
    const { forward, backward, leftward, rightward } = control;
    states.isMoving = forward || backward || leftward || rightward;
    states.isNotMoving = !states.isMoving;
    states.isRunning = shift && states.isMoving;
  }
}
