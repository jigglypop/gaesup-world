import { Collider } from "@dimforge/rapier3d-compat";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, quat } from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import { refsType } from "../../../controller/type";
import { urlsType } from "../../../world/context/type";
import { CharacterInnerRef } from "../../inner/character";

export type passiveCharacterPropsType = {
  position: THREE.Vector3;
  euler: THREE.Euler;
  urls: urlsType;
  currentAnimation: string;
  gravityScale?: number;
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

  const { position, euler } = useMemo(() => {
    return {
      position: props.position,
      euler: props.euler,
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

  return (
    <CharacterInnerRef
      position={position}
      refs={refs}
      urls={props.urls}
      currentAnimation={props.currentAnimation}
    >
      {props.children}
    </CharacterInnerRef>
  );
}
