import { Collider } from "@dimforge/rapier3d-compat";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, quat } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CharacterInnerRef } from "../../inner/character";
import { innerRefType } from "../type";
import { passiveCharacterPropsType } from "./type";

export function PassiveCharacter(props: passiveCharacterPropsType) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const colliderRef = useRef<Collider>(null);
  const refs: innerRefType = {
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    colliderRef,
  };

  useEffect(() => {
    if (rigidBodyRef && rigidBodyRef.current) {
      rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }, []);

  useFrame((_, delta) => {
    if (innerGroupRef && innerGroupRef.current) {
      innerGroupRef.current.quaternion.rotateTowards(
        quat().setFromEuler(props.rotation),
        10 * delta
      );
    }
  });

  return (
    <CharacterInnerRef
      isActive={false}
      componentType={"character"}
      {...refs}
      {...props}
    >
      {props.children}
    </CharacterInnerRef>
  );
}
