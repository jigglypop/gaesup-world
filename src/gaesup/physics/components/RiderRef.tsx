import { useAnimations } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useAnimationPlayer } from '../../utils/animation';
import { useGltfAndSize } from '../../utils/gltf';

type riderRefType = {
  url: string;
  children?: React.ReactNode;
  offset?: THREE.Vector3;
  currentAnimation?: string;
};

export default function RiderRef({ url, children, offset, currentAnimation }: riderRefType) {
  const { gltf } = useGltfAndSize({ url });
  const { animations, scene } = gltf;
  const { actions, ref: animationRef } = useAnimations(animations);
  const characterClone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes: characterNodes } = useGraph(characterClone);
  const characterObjectNode = Object.values(characterNodes).find(
    (node) => node.type === 'Object3D',
  );
  useAnimationPlayer(actions, true);
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
            const material = Array.isArray(characterNode.material)
              ? characterNode.material.map((m) => m.clone())
              : characterNode.material.clone();
            return (
              <skinnedMesh
                castShadow
                receiveShadow
                material={material}
                geometry={characterNode.geometry}
                skeleton={characterNode.skeleton}
                key={key}
              />
            );
          } else if (characterNode instanceof THREE.Mesh) {
            const material = Array.isArray(characterNode.material)
              ? characterNode.material.map((m) => m.clone())
              : characterNode.material.clone();
            return (
              <mesh
                castShadow
                receiveShadow
                material={material}
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
