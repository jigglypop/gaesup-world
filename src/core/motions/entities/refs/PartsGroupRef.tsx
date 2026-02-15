import { useMemo } from 'react';

import { useGLTF } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { useAnimationPlayer } from '@hooks/useAnimationPlayer';

import { ModelRendererProps, PartsGroupRefProps } from './types';

export function ModelRenderer({ nodes, color, skeleton, url, excludeNodeNames }: ModelRendererProps) {
  const processedNodes = useMemo(() => {
    const exclude =
      excludeNodeNames && excludeNodeNames.length > 0
        ? new Set(excludeNodeNames)
        : null;
    return Object.keys(nodes)
      .map((name: string, key: number) => {
        if (exclude && exclude.has(name)) return null;
        const node = nodes[name];
        if (node instanceof THREE.SkinnedMesh) {
          const material = Array.isArray(node.material)
            ? node.material.map((m) => {
                const cloned = m.clone();
                if (color && 'color' in cloned && cloned.color instanceof THREE.Color) {
                  cloned.color.set(color);
                }
                return cloned;
              })
            : (() => {
                const cloned = node.material.clone();
                if (color && 'color' in cloned && cloned.color instanceof THREE.Color) {
                  cloned.color.set(color);
                }
                return cloned;
              })();

          return {
            type: 'skinnedMesh' as const,
            material,
            geometry: node.geometry,
            skeleton: skeleton || node.skeleton,
            key: `${url}-${name}-${key}`,
          };
        } else if (node instanceof THREE.Mesh) {
          const material = Array.isArray(node.material)
            ? node.material.map((m) => {
                const cloned = m.clone();
                if (color && 'color' in cloned && cloned.color instanceof THREE.Color) {
                  cloned.color.set(color);
                }
                return cloned;
              })
            : (() => {
                const cloned = node.material.clone();
                if (color && 'color' in cloned && cloned.color instanceof THREE.Color) {
                  cloned.color.set(color);
                }
                return cloned;
              })();

          return {
            type: 'mesh' as const,
            material,
            geometry: node.geometry,
            key: `${url}-${name}-${key}`,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [nodes, color, skeleton, url, excludeNodeNames]);

  return (
    <>
      {processedNodes.map((nodeData) => {
        if (!nodeData) return null;
        if (nodeData.type === 'skinnedMesh') {
          return (
            <skinnedMesh
              castShadow
              receiveShadow
              material={nodeData.material}
              geometry={nodeData.geometry}
              skeleton={nodeData.skeleton}
              key={nodeData.key}
              frustumCulled={false}
            />
          );
        } else {
          return (
            <mesh
              castShadow
              receiveShadow
              material={nodeData.material}
              geometry={nodeData.geometry}
              key={nodeData.key}
            />
          );
        }
      })}
    </>
  );
}

export function PartsGroupRef({ url, isActive, color, skeleton }: PartsGroupRefProps) {
  const { scene } = useGLTF(url) as { scene: THREE.Object3D };
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);
  useAnimationPlayer(isActive);
  return (
    <group>
      <ModelRenderer
        nodes={nodes}
        url={url}
        {...(color ? { color } : {})}
        {...(skeleton ? { skeleton } : {})}
      />
    </group>
  );
}
