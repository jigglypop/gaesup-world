import initCallback from "../../../controller/initialize/callback";
import { controllerInnerType, refsType } from "../../../controller/type";
import { CharacterCapsuleCollider } from "./collider";
import { CharacterGroup } from "./group";

import { CharacterInnerGroupRef, InnerGroupRef } from "./innerGltf";
import { CharacterOuterGroup } from "./outerGroup";
import { CharacterRigidBody } from "./rigidbody";
import { CharacterSlopeRay } from "./slopeRay";

export function CharacterRef({
  props,
  refs,
  isPassive,
}: {
  props: controllerInnerType;
  refs: refsType;
  isPassive?: boolean;
}) {
  initCallback(props);

  return (
    <CharacterOuterGroup>
      <CharacterRigidBody ref={refs.rigidBodyRef} props={props}>
        <CharacterCapsuleCollider props={props} ref={refs.capsuleColliderRef} />
        <CharacterGroup ref={refs.outerGroupRef} props={props}>
          <CharacterSlopeRay
            slopeRay={props.slopeRay}
            groundRay={props.groundRay}
            ref={refs.slopeRayOriginRef}
          />
          {props.children}
          <InnerGroupRef ref={refs.innerGroupRef} />
          <CharacterInnerGroupRef
            props={props}
            groundRay={props.groundRay}
            refs={refs}
            ref={refs.characterInnerRef}
          />
        </CharacterGroup>
      </CharacterRigidBody>
    </CharacterOuterGroup>
  );
}
