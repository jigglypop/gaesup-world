import { vec3 } from "@react-three/rapier";
import { calcPropType } from "..";

export default function impulse(prop: calcPropType) {
  const { rigidBodyRef, constant, control } = prop;
  const [current, setCurrent] = prop.current;
  const { accelRate } = constant;
  const { accel } = control;
  current.direction.multiplyScalar(accel ? accelRate : 1);
  rigidBodyRef.current.applyImpulse(
    vec3({
      x: current.direction.x,
      y: 0,
      z: current.direction.z,
    }),
    false
  );

  setCurrent((current) => ({
    ...current,
    position: vec3(rigidBodyRef.current!.translation()),
    velocity: vec3(rigidBodyRef.current!.linvel()),
  }));
}
