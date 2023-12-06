import { calcPropType } from "..";

export default function gravity(prop: calcPropType) {
  const { rigidBodyRef } = prop;
  rigidBodyRef.current.setGravityScale(0, false);
}