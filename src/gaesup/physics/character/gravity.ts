import { calcType } from "../type";

export default function gravity(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { states },
  } = prop;
  if (states.isJumping || states.isFalling) {
    rigidBodyRef.current.setGravityScale(1.5, false);
  } else {
    rigidBodyRef.current.setGravityScale(1.0, false);
  }
} 