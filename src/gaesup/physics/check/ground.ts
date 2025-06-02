import { vec3 } from "@react-three/rapier";
import { calcType } from "../type";

export default function checkOnTheGround(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { states, activeState },
  } = prop;

  // RigidBody의 velocity로 ground 상태 판단 (더 안정적)
  if (rigidBodyRef.current) {
    const velocity = rigidBodyRef.current.linvel();
    const position = rigidBodyRef.current.translation();
    
    // Y velocity가 거의 0이고, Y position이 적당한 범위에 있으면 지면에 있다고 판단
    const isNearGround = position.y <= 15; // 발판이 높은 곳에 있으므로 증가 (3 → 15)
    const isNotFalling = Math.abs(velocity.y) < 0.5; // Y velocity가 작으면 지면에 있다고 판단
    
    if (isNearGround && isNotFalling) {
      states.isOnTheGround = true;
      states.isFalling = false;
    } else {
      states.isOnTheGround = false;
      states.isFalling = velocity.y < -0.1; // 아래로 떨어지고 있으면 falling
    }
    
    // activeState 업데이트
    activeState.position = vec3(position);
    activeState.velocity = vec3(velocity);
  } else {
    // RigidBody가 없으면 기본값
    states.isOnTheGround = false;
    states.isFalling = true;
  }
}
