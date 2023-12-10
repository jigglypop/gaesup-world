import { calcPropType } from "../type";

export default function turn(prop: calcPropType) {
  const {
    outerGroupRef,
    constant,
    delta,
    worldContext: { activeState },
  } = prop;
  const { turnSpeed } = constant;

  activeState.quat.setFromEuler(activeState.euler);
  outerGroupRef.current.quaternion.rotateTowards(
    activeState.quat,
    delta * turnSpeed
  );
}
