import { Collider } from "@dimforge/rapier3d-compat";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, quat } from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import { refsType } from "../../../controller/type";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { CharacterCapsuleCollider } from "./collider";
import { passiveCharacterPropsType } from "./type";

export function PassiveCharacter(props: passiveCharacterPropsType) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const colliderRef = useRef<Collider>(null);
  const refs: Partial<refsType> = {
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    capsuleColliderRef: colliderRef,
  };

  const { position, euler, currentAnimation, characterUrl } = useMemo(() => {
    return {
      position: props.position,
      euler: props.euler,
      currentAnimation: props.currentAnimation,
      characterUrl: props.url.characterUrl,
    };
  }, [props]);

  useEffect(() => {
    if (rigidBodyRef || rigidBodyRef.current) {
      rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }, []);

  useFrame((_, delta) => {
    if (innerGroupRef && innerGroupRef.current) {
      innerGroupRef.current.quaternion.rotateTowards(
        quat().setFromEuler(euler),
        10 * delta
      );
    }
  });

  return (
    <OuterGroupRef ref={refs.outerGroupRef}>
      {props.children}
      {characterUrl && (
        <RigidBodyRef ref={refs.rigidBodyRef} position={position}>
          <CharacterCapsuleCollider
            height={props.height}
            diameter={props.diameter}
            ref={colliderRef}
          />
          <InnerGroupRef
            currentAnimation={currentAnimation}
            ref={refs.innerGroupRef}
            url={characterUrl}
          />
        </RigidBodyRef>
      )}
    </OuterGroupRef>
  );
}
