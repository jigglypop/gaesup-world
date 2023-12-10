import { calcPropType } from "../type";

export default function gravity(prop: calcPropType) {
  const { rigidBodyRef, groundRay } = prop;

  if (groundRay.hit) {
    rigidBodyRef.current.setGravityScale(1, false);
  } else {
    rigidBodyRef.current.setGravityScale(0.2, false);
  }
}
