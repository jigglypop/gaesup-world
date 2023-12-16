import { calcPropType } from "../type";

export default function turn(prop: calcPropType) {
  const {
    outerGroupRef,
    delta,
    worldContext: { activeState },
    controllerContext: {
      character: { turnSpeed },
    },
  } = prop;
  activeState.quat.setFromEuler(activeState.euler);
  outerGroupRef.current.quaternion.rotateTowards(
    activeState.quat,
    delta * turnSpeed
  );
}
