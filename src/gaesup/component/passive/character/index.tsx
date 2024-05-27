import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
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

  return (
    <CharacterInnerRef
      isActive={false}
      componentType={"character"}
      controllerOptions={
        props.controllerOptions || {
          lerp: {
            cameraTurn: 1,
            cameraPosition: 1,
          },
        }
      }
      position={props.position}
      rotation={props.rotation}
      groundRay={props.groundRay}
      currentAnimation={props.currentAnimation}
      parts={props.parts}
      {...refs}
      {...props}
    >
      {props.children}
    </CharacterInnerRef>
  );
}
