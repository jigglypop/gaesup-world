import { calcPropType } from "../type";

export default function gravity(prop: calcPropType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
  } = prop;
  rigidBodyRef.current.setGravityScale(
    activeState.position.y < 10
      ? ((1 - 0.1) / (0 - 10)) * activeState.position.y + 1
      : 0.1,
    false
  );
}
