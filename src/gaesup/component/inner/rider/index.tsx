import { useAnimations } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import { ReactNode, useCallback, useEffect, useMemo } from "react";
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

  const characterObjectNode = useMemo(
    () =>
      Object.values(characterNodes).find((node) => node.type === "Object3D"),
    [characterNodes]
  );

  useEffect(() => {
    playActions({
      type: "character",
      currentAnimation: currentAnimation || "ride",
      actions,
      animationRef,
      isActive: false,
    });

    return () => {
      // Cleanup actions
      Object.values(actions).forEach((action) => action?.stop());
    };
  }, [actions, animationRef, currentAnimation]);

  useEffect(() => {
    return () => {
      // Cleanup nodes
      Object.values(characterNodes).forEach((node) => {
        if (node instanceof THREE.Mesh || node instanceof THREE.SkinnedMesh) {
          node.geometry.dispose();
          if (Array.isArray(node.material)) {
            node.material.forEach((material) => material.dispose());
          } else {
            node.material.dispose();
          }
        }
      });
    };
  }, [characterNodes]);
  useEffect(() => {
    return () => {
      if (gltf) {
        gltf.scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (object.material.isMaterial) {
              object.material.dispose();
            } else if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            }
          } else if (object instanceof THREE.SkinnedMesh) {
            object.geometry.dispose();
            if (object.material.isMaterial) {
              object.material.dispose();
            } else if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            }
          }
        });
      }
    };
  }, [gltf]);
  const renderNode = useCallback((node: THREE.Object3D, key: number) => {
    if (node instanceof THREE.SkinnedMesh) {
      return (
        <skinnedMesh
          castShadow
          receiveShadow
          material={node.material}
          geometry={node.geometry}
          skeleton={node.skeleton}
          key={key}
        />
      );
    } else if (node instanceof THREE.Mesh) {
      return (
        <mesh
          castShadow
          receiveShadow
          material={node.material}
          geometry={node.geometry}
          key={key}
        />
      );
    }
    return null;
  }, []);

  return (
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
      {Object.values(characterNodes).map(renderNode)}
      {children}
    </group>
  );
}
