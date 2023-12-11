import { calcPropType } from "../type";

export default function damping(prop: calcPropType) {
  const { rigidBodyRef } = prop;
  rigidBodyRef.current.setLinearDamping(0.1);
}
