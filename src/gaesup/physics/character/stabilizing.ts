import { calcPropType } from "../type";

export default function stabilizing(prop: calcPropType) {
  const { rigidBodyRef } = prop;
  rigidBodyRef.current.setEnabledRotations(false, false, false, false);
}
