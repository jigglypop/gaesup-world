import { calcPropType } from "../type";

export default function turn(prop: calcPropType) {
  const {
    outerGroupRef,
    innerGroupRef,
    rigidBodyRef,
    delta,
    worldContext: { activeState },
    controllerContext: {
      character: { turnSpeed },
    },
  } = prop;
  activeState.quat.setFromEuler(activeState.euler);
  // outerGroupRef.current.quaternion.rotateTowards(
  //   activeState.quat,
  //   delta * turnSpeed
  // );
  innerGroupRef.current.quaternion.rotateTowards(
    activeState.quat,
    delta * turnSpeed
  );
}
