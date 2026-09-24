import { useMemo } from 'react';

import { useAnimations } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { useAnimationPlayer } from '@/core/hooks';

import { ModelRenderer } from './PartsGroupRef';
import { useSceneToon } from '../../../rendering/useSceneToon';
import { useGltfAndSize } from '../../hooks';
import { riderRefType } from '../types';

export default function RiderRef({
  url,
  children,
  offset = new THREE.Vector3(0, 0, 0),
}: riderRefType) {
  const { gltf } = useGltfAndSize({ url });
  const { animations, scene } = gltf;
  const { ref: animationRef } = useAnimations(animations);
  const characterClone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const graph = useGraph(characterClone);
  const toonRevision = useSceneToon(characterClone);
  const characterNodes = useMemo(() => ({ ...graph.nodes }), [graph.nodes, toonRevision]);
  const characterObjectNode = Object.values(characterNodes).find(
    (node) => node.type === 'Object3D',
  );
  useAnimationPlayer(true);
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
      <ModelRenderer nodes={characterNodes} url={url} color={undefined} skeleton={null} />
      {children}
    </group>
  );
}
