import { useAnimations } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useAnimationPlayer } from '../../../hooks/useGaesupAnimation/useAnimationPlayer';
import { useGltfAndSize } from '../../../hooks/useGaesupGltf';
import { riderRefType } from './types';

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
