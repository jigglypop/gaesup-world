import { RapierRigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { gaesupPassivePropsType } from "../../../hooks/useGaesupController";
import mutation from "../../../mutation";
import { PassiveWrapperRef } from "../common/PassiveWrapperRef";
import { CharacterCapsuleCollider } from "./collider";

export function PassiveCharacter({ props }: { props: gaesupPassivePropsType }) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const characterInnerRef = useRef<THREE.Group>(null);

  const refs = {
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    characterInnerRef,
  };

  mutation({
    refs,
    props,
    delta: 0.9,
  });

  return (
    <PassiveWrapperRef props={props} refs={refs} url={props.url?.characterUrl}>
      <CharacterCapsuleCollider collider={props.characterCollider} />
    </PassiveWrapperRef>
  );
}
