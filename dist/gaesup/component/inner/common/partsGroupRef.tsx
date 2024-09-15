import { useAnimations, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import playActions from "../../../animation/actions";
import { componentTypeString } from "../../passive/type";

export const PartsGroupRef = ({
  url,
  isActive,
  componentType,
  currentAnimation,
  color,
  skeleton,
}: {
  url: string;
  isActive: boolean;
  componentType: componentTypeString;
  currentAnimation: string;
  color?: string;
  skeleton?: THREE.Skeleton;
}) => {
  const { scene, animations } = useGLTF(url);
  const { actions, ref } = useAnimations(animations);

  const clonedMeshes = useMemo(() => {
    const meshes = [];
    scene.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh) {
        const clonedMesh = child.clone();
        clonedMesh.skeleton = skeleton;
        clonedMesh.bind(skeleton, clonedMesh.bindMatrix);
        meshes.push(clonedMesh);
      }
    });
    return meshes;
  }, [scene, skeleton]);

  playActions({
    type: componentType,
    actions,
    animationRef: ref,
    currentAnimation: isActive ? undefined : currentAnimation,
    isActive,
  });

  return (
    <>
      {clonedMeshes.map((mesh, key) => {
        return (
          <skinnedMesh
            castShadow
            receiveShadow
            geometry={mesh.geometry}
            skeleton={skeleton}
            key={key}
            material={
              mesh.name === "color" && color
                ? new THREE.MeshStandardMaterial({ color })
                : mesh.material
            }
          />
        );
      })}
    </>
  );
};
