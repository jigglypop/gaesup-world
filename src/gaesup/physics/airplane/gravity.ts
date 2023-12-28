import { calcPropType } from "../type";

export default function gravity(prop: calcPropType) {
  const {
    rigidBodyRef,
    groundRay,
    controllerContext: {
      airplane: { buoyancy },
    },
    worldContext: { airplaneCollider },
  } = prop;

  if (groundRay.hit) {
    airplaneCollider.gravity =
      (1 - buoyancy) / (groundRay.length - groundRay.hit.toi);
    rigidBodyRef.current.setGravityScale(airplaneCollider.gravity, false);
  } else {
    airplaneCollider.gravity = buoyancy;
    rigidBodyRef.current.setGravityScale(airplaneCollider.gravity, false);
  }
}
