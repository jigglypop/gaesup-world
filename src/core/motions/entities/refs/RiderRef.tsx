import { useLayoutEffect, useMemo, useState } from 'react';

import { useAnimations } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { useAnimationPlayer } from '@/core/hooks';

import { ModelRenderer } from './PartsGroupRef';
import {
  applyToonToScene,
  getDefaultToonMode,
  releaseToonFromScene,
} from '../../../rendering/toon';
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
  const [toonRevision, setToonRevision] = useState(0);
  const graph = useGraph(characterClone);
  useLayoutEffect(() => {
    if (!getDefaultToonMode()) return;
    applyToonToScene(characterClone);
    setToonRevision((revision) => revision + 1);
    return () => releaseToonFromScene(characterClone);
  }, [characterClone]);
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
