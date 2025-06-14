import { useAnimations } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useAnimationPlayer } from '../../utils/animation';
import { useGltfAndSize } from '../../utils/gltf';
import { ModelRenderer } from './PartsGroupRef';
import { riderRefType } from './types';

export default function RiderRef({
  url,
  children,
  offset = new THREE.Vector3(0, 0, 0),
}: riderRefType) {
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
        <ModelRenderer nodes={characterNodes} url={url} />
        {children}
      </group>
    </>
  );
}
