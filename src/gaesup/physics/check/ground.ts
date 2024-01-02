import { vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

export default function checkOnTheGround(prop: calcPropType) {
  const {
    capsuleColliderRef,
    groundRay,
    worldContext: { characterCollider: collider, states, activeState },
  } = prop;

  groundRay.origin.addVectors(activeState.position, vec3(groundRay.offset));
  if (!groundRay.hit || !groundRay.rayCast || !capsuleColliderRef.current) {
    states.isOnTheGround = false;
    return;
  }
  if (groundRay.hit.toi < collider.radius + 0.4) {
    states.isOnTheGround = true;
  } else {
    states.isOnTheGround = false;
  }
}
