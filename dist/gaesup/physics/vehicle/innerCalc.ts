import { quat, vec3 } from "@react-three/rapier";
import { calcType } from "../type";

export default function innerCalc(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
  } = prop;

  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());

  rigidBodyRef.current.setRotation(
    quat().setFromEuler(activeState.euler.clone()),
    false
  );
}
