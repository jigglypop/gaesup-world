import { Collider } from "@dimforge/rapier3d-compat";
import { useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, quat } from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import playActions from "../../../animation/actions";
import { refsType } from "../../../controller/type";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { urlsType } from "../../../world/context/type";
import { CharacterInnerRef } from "../../inner/character";

export type passiveCharacterPropsType = {
  position: THREE.Vector3;
  euler: THREE.Euler;
  urls: urlsType;
  currentAnimation: string;
  children?: React.ReactNode;
};

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
      characterUrl: props.urls.characterUrl,
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

  const { gltf } = useGltfAndSize({ url: props.urls.characterUrl });
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
      urls={props.urls}
    >
      {props.children}
    </CharacterInnerRef>
  );
}
