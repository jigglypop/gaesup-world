import { vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

export default function impulse(prop: calcPropType) {
  const {
    rigidBodyRef,
    worldContext: { states, activeState },
    dispatch,
  } = prop;
  const { isMoving, isRunning } = states;
  const {
    controllerContext: {
      character: { walkSpeed, runSpeed, jumpSpeed },
    },
  } = prop;
  const { isOnTheGround, isJumping } = states;
  const impulse = vec3();
  if (isJumping && isOnTheGround) {
    impulse.setY(jumpSpeed * rigidBodyRef.current.mass());
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
  }
  rigidBodyRef.current.applyImpulse(impulse, true);
  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());
  dispatch({
    type: "update",
    payload: {
      activeState: {
        ...activeState,
      },
    },
  });
}
