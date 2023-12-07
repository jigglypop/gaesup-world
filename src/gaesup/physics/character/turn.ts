import { calcPropType } from "..";

export default function turn(prop: calcPropType) {
  const { outerGroupRef, constant, delta } = prop;
  const [current] = prop.current;
  const { turnSpeed } = constant;
  current.quat.setFromEuler(current.euler);
  outerGroupRef.current.quaternion.rotateTowards(
    current.quat,
    delta * turnSpeed
  );
}
