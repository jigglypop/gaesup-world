import { vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

export default function impulse(prop: calcPropType) {
  const {
    rigidBodyRef,
    constant,
    control,
    worldContext: { activeState },
  } = prop;
  const { shift } = control;
  const { accelRate } = constant;

  rigidBodyRef.current.applyImpulse(
    vec3({
      x: activeState.direction.x,
      y: activeState.direction.y,
      z: activeState.direction.z,
    }),
    false
  );
}
