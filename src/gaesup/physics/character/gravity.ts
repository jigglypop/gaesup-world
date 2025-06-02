import { calcType } from "../type";

export default function gravity(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { states },
  } = prop;
  
  // 점프 중이거나 떨어질 때 더 강한 중력 적용
  if (states.isJumping || states.isFalling) {
    rigidBodyRef.current.setGravityScale(1.5, false);
  } else {
    // 지면에 있을 때는 기본 중력
    rigidBodyRef.current.setGravityScale(1.0, false);
  }
} 