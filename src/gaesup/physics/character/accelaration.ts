import { vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

export default function accelaration(prop: calcPropType) {
  const {
    worldContext: { states, activeState },
    controllerContext: {
      character: { walkSpeed, runSpeed },
    },
  } = prop;
  const { isMoving, isRunning } = states;
  if (!isMoving) return null;
  const speed = isRunning ? runSpeed : walkSpeed;
  const velocity = vec3().addScalar(speed).multiply(activeState.dir);
  activeState.acceleration.copy(velocity).sub(activeState.velocity);
}
