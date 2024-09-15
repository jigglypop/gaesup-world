import { useAnimations } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import { ReactNode, useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playActions from "../../../animation/actions";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";

export type riderRefType = {
  url: string;
  children?: ReactNode;
  offset?: THREE.Vector3;
  euler?: THREE.Euler;
  currentAnimation?: string;
};

export default function RiderRef({
  url,
  children,
  offset,
  currentAnimation,
}: riderRefType) {
  const { gltf } = useGltfAndSize({ url });
  const { animations, scene } = gltf;
  const { actions, ref: animationRef } = useAnimations(animations);
  const characterClone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes: characterNodes } = useGraph(characterClone);
  const characterObjectNode = Object.values(characterNodes).find(
    (node) => node.type === "Object3D"
  );
  playActions({
    type: "character",
    currentAnimation: currentAnimation || "ride",
    actions,
    animationRef,
    isActive: false,
  });
  return (
    <>
      <group position={offset}>
        {characterObjectNode && (
          <primitive
            object={characterObjectNode}
            visible={false}
            receiveShadow
            castShadow
            ref={animationRef}
          />
        )}
        {Object.keys(characterNodes).map((name: string, key: number) => {
          const characterNode = characterNodes[name];
          if (characterNode instanceof THREE.SkinnedMesh) {
            return (
              <skinnedMesh
                castShadow
                receiveShadow
                material={characterNode.material}
                geometry={characterNode.geometry}
                skeleton={characterNode.skeleton}
                key={key}
              />
            );
          } else if (characterNode instanceof THREE.Mesh) {
            return (
              <mesh
                castShadow
                receiveShadow
                material={characterNode.material}
                geometry={characterNode.geometry}
                key={key}
              />
            );
          }
        })}
        {children}
      </group>
    </>
  );
}
