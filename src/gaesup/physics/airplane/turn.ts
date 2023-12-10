import { calcPropType } from "../type";

export default function turn(prop: calcPropType) {
  const {
    rigidBodyRef,
    innerGroupRef,
    worldContext: { activeState },
  } = prop;

  activeState.quat.setFromEuler(activeState.euler);
  rigidBodyRef.current.setRotation(activeState.quat, true);
}
