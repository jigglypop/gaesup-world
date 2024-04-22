import { vec3 } from "@react-three/rapier";
import { calcType } from "../type";

export default function checkOnTheGround(prop: calcType) {
  const {
    colliderRef,
    groundRay,
    worldContext: { states, activeState },
  } = prop;

  groundRay.origin.addVectors(activeState.position, vec3(groundRay.offset));
  if (!groundRay.hit || !groundRay.rayCast || !colliderRef.current) {
    states.isOnTheGround = false;
  }
  if (groundRay.hit) {
    if (groundRay.hit.toi >= groundRay.length * 0.8) {
      states.isFalling = true;
      states.isLanding = false;
      states.isOnTheGround = false;
    } else if (
      groundRay.length * 0.4 < groundRay.hit.toi &&
      groundRay.hit.toi < groundRay.length * 0.8
    ) {
      states.isLanding = true;
      states.isFalling = false;
      states.isOnTheGround = false;
    } else {
      states.isFalling = false;
      states.isLanding = false;
      states.isOnTheGround = true;
    }
  }
}
