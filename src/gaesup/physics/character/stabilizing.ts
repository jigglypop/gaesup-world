import { vec3 } from "@react-three/rapier";
import { calcPropType } from "..";

export default function stabilizing(prop: calcPropType) {
  const { rigidBodyRef, constant } = prop;
  const { reconsil, rotational, vertical } = constant;
  const rotation = rigidBodyRef.current.rotation();
  const angvel = rigidBodyRef.current.angvel();
  rigidBodyRef.current.applyTorqueImpulse(
    vec3(rotation)
      .multiplyScalar(-reconsil)
      .add(
        vec3({
          x: -rotational,
          y: -vertical,
          z: -rotational,
        }).multiply(vec3(angvel))
      ),
    false
  );
}
