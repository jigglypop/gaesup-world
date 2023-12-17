import { controllerInnerType, refsType } from "../../../controller/type";

import { CharacterInnerGroupRef } from "../character/innerGltf";
import { AirplaneCollider } from "./collider";
import { AirplaneGroup } from "./group";
import { AirplaneInnerGroupRef } from "./innerGltf";
import { AirplaneRigidBody } from "./rigidbody";

export function AirplaneRef({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  return (
    <AirplaneGroup ref={refs.outerGroupRef} props={props}>
      <AirplaneRigidBody ref={refs.rigidBodyRef} props={props}>
        <AirplaneCollider prop={props} ref={refs.capsuleColliderRef} />
        {props.isRider && (
          <CharacterInnerGroupRef
            props={props}
            groundRay={props.groundRay}
            refs={refs}
            ref={refs.characterInnerRef}
          />
        )}
        <AirplaneInnerGroupRef ref={refs.innerGroupRef} />
      </AirplaneRigidBody>
    </AirplaneGroup>
  );
}
