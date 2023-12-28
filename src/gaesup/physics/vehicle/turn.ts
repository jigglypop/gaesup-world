import { quat } from "@react-three/rapier";
import { calcPropType } from "../type";

export default function turn(prop: calcPropType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
  } = prop;

  // activeState.quat.setFromEuler(activeState.euler);
  rigidBodyRef.current.setRotation(
    quat().setFromEuler(activeState.euler),
    false
  );
}
