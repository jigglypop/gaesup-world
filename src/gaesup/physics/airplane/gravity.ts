import { calcPropType } from "../type";

export default function gravity(prop: calcPropType) {
  const {
    rigidBodyRef,
    groundRay,
    controllerContext: { airplane },
  } = prop;

  const { buoyancy } = airplane;
  if (groundRay.hit) {
    rigidBodyRef.current.setGravityScale(1, false);
  } else {
    rigidBodyRef.current.setGravityScale(buoyancy, false);
  }
}
