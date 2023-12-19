import { vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

export default function impulse(prop: calcPropType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
    controllerContext: { airplane },
  } = prop;
  const { maxSpeed } = airplane;

  const velocity = rigidBodyRef.current.linvel();
  const currentSpeed = Math.sqrt(
    velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2
  );
  if (currentSpeed > maxSpeed) {
    return null;
  }

  rigidBodyRef.current.applyImpulse(
    vec3({
      x: activeState.direction.x,
      y: activeState.direction.y,
      z: activeState.direction.z,
    }),
    false
  );
}
