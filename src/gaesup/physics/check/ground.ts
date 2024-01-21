import { vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

export default function checkOnTheGround(prop: calcPropType) {
  const {
    colliderRef,
    groundRay,
    worldContext: { states, activeState },
  } = prop;

  groundRay.origin.addVectors(activeState.position, vec3(groundRay.offset));
  if (!groundRay.hit || !groundRay.rayCast || !colliderRef.current) {
    states.isOnTheGround = false;
    return;
  }
  if (groundRay.hit.toi < groundRay.length + 0.5) {
    states.isOnTheGround = true;
  } else {
    states.isOnTheGround = false;
  }
}
