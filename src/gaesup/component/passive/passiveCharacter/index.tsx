import { RapierRigidBody } from "@react-three/rapier";
import { useRef } from "react";
import mutation from "../../../mutation";
import { passiveCharacterType } from "../type";
import { PassiveCharacterInnerGroupRef } from "./innerGltf";
import { PassiveCharacterOuterGroup } from "./outerGroup";
import { PassiveCharacterRigidBody } from "./rigidbody";

export function PassiveCharacter({
  mode,
  state,
  url,
  current,
}: passiveCharacterType) {
  const passiveCharacterRef = useRef<THREE.Group>(null);
  const passiveCharacterOuterRef = useRef<THREE.Group>(null);
  const passiveRigidBodyRef = useRef<RapierRigidBody>(null);

  mutation({
    outerGroupRef: passiveCharacterOuterRef,
    rigidBodyRef: passiveRigidBodyRef,
    state,
    mode,
    delta: 0.9,
  });

  return (
    <PassiveCharacterRigidBody ref={passiveRigidBodyRef}>
      <PassiveCharacterOuterGroup ref={passiveCharacterOuterRef}>
        <PassiveCharacterInnerGroupRef
          url={url}
          current={current}
          ref={passiveCharacterRef}
        />
      </PassiveCharacterOuterGroup>
    </PassiveCharacterRigidBody>
  );
}
