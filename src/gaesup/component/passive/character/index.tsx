import { Collider } from "@dimforge/rapier3d-compat";
import { useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, quat } from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import playActions from "../../../animation/actions";
import { refsType } from "../../../controller/type";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { CharacterInnerRef } from "../../inner/character";
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
    colliderRef,
  };

  const { position, euler, currentAnimation } = useMemo(() => {
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

  const { gltf } = useGltfAndSize({ url: props.url.characterUrl });
  const animationResult = useAnimations(gltf.animations);
  const { animationRef } = playActions({
    type: "character",
    animationResult,
    currentAnimation,
  });

  return (
    <CharacterInnerRef
      animationRef={animationRef}
      position={position}
      refs={refs}
      urls={props.url}
    >
      {props.children}
    </CharacterInnerRef>
  );
}
