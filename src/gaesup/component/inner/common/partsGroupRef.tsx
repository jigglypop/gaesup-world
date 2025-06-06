import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { usePlayActions } from '../../../atoms/animationAtoms';
import { componentTypeString } from '../../passive/type';

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

  useEffect(() => {
    return () => {
      clonedMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });

      if (actions) {
        Object.values(actions).forEach((action) => {
          if (action) {
            action.stop();
          }
        });
      }
    };
  }, [clonedMeshes, actions]);

  usePlayActions({
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
              mesh.name === 'color' && color
                ? new THREE.MeshStandardMaterial({ color })
                : mesh.material
            }
          />
        );
      })}
    </>
  );
};
