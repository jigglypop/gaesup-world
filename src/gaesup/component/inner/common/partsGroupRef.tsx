import { useAnimations, useGLTF } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playActions from "../../../animation/actions";
import { componentTypeString } from "../../passive/type";

export const PartsGroupRef = ({
  url,
  isActive,
  componentType,
  currentAnimation,
}: {
  url: string;
  isActive: boolean;

  componentType: componentTypeString;
  currentAnimation: string;
}) => {
  const { scene, animations } = useGLTF(url);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions, ref } = useAnimations(animations);

  const { nodes } = useGraph(clone);
  const objectNode = Object.values(nodes).find(
    (node) => node.type === "Object3D"
  );

  playActions({
    type: componentType,
    actions,
    animationRef: ref,
    currentAnimation: isActive ? undefined : currentAnimation,
    isActive,
  });
  return (
    <>
      <primitive
        object={objectNode}
        visible={false}
        receiveShadow
        castShadow
        ref={ref}
      />
      {Object.keys(nodes).map((name: string, key: number) => {
        const node = nodes[name];
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
      })}
    </>
  );
};
