import { calcPropType } from "../type";

export default function damping(prop: calcPropType) {
  const { rigidBodyRef, constant } = prop;
  rigidBodyRef.current.setLinearDamping(constant.linearDamping);
}
