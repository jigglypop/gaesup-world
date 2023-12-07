import { calcPropType } from "..";

export default function turn(prop: calcPropType) {
  const [current] = prop.current;
  const { constant, rigidBodyRef, move } = prop;

  current.quat.setFromEuler(current.euler);
  rigidBodyRef.current.setRotation(current.quat, false);
}
