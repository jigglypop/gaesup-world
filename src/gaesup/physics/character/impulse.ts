import { vec3 } from "@react-three/rapier";
import { calcType } from "../type";

export default function impulse(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { states, activeState },
  } = prop;
  const { isMoving, isRunning } = states;
  const {
    controllerContext: {
      character: { walkSpeed, runSpeed, jumpSpeed },
    },
  } = prop;
  const { isOnTheGround, isJumping } = states;
  const impulse = vec3();
  
  // 점프: 지면에 있고 점프 상태일 때만 한 번 적용
  if (isJumping && isOnTheGround) {
    // 현재 velocity를 가져와서 Y만 교체하는 방식으로 더 자연스러운 점프
    const currentVelocity = rigidBodyRef.current.linvel();
    const newVelocity = vec3({
      x: currentVelocity.x,
      y: jumpSpeed, // 직접 velocity 설정 (mass 곱하지 않음)
      z: currentVelocity.z
    });
    rigidBodyRef.current.setLinvel(newVelocity, true);
  }
  
  if (isMoving) {
    const speed = isRunning ? runSpeed : walkSpeed;
    const velocity = vec3()
      .addScalar(speed)
      .multiply(activeState.dir.clone().normalize().negate());
    const M = rigidBodyRef.current.mass();
    // a = v / t = dv / 1 (dt = 1)
    const A = velocity.clone().sub(activeState.velocity);
    const F = A.multiplyScalar(M);
    impulse.setX(F.x);
    impulse.setZ(F.z);
    
    // 수평 이동만 impulse로 적용
    rigidBodyRef.current.applyImpulse(impulse, true);
  }
  
  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());
}
