import { vec3 } from "@react-three/rapier";
import { calcPropType } from "..";

export default function impulse(prop: calcPropType) {
  const { rigidBodyRef, constant, control, outerGroupRef } = prop;
  const [current, setCurrent] = prop.current;
  const { accelRate } = constant;
  const { shift } = control;
  // current.direction.multiplyScalar(shift ? accelRate : 1);
  // current.position.setFrom
  // rigidBodyRef.current.applyImpulse(
  //   V30()
  //     .addScalar(shift ? 1 : 0)
  //     .multiply(
  //       vec3({
  //         x: current.direction.x,
  //         y: current.direction.y,
  //         z: current.direction.z,
  //       })
  //     ),
  //   false
  // );
  // current.position.setFromEuler(current.euler);

  setCurrent((current) => ({
    ...current,
    position: vec3(rigidBodyRef.current!.translation()),
    velocity: vec3(rigidBodyRef.current!.linvel()),
  }));
}
