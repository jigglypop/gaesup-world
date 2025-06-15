import { useAnimations, useGLTF } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useAnimationPlayer } from '../../utils/animation';
import { ModelRendererProps, PartsGroupRefProps } from './types';

export function ModelRenderer({ nodes, color, skeleton, url }: ModelRendererProps) {
  const processedNodes = useMemo(() => {
    return Object.keys(nodes)
      .map((name: string, key: number) => {
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
  }, [nodes, color, skeleton, url]);

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
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations);

  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);

  useAnimationPlayer(actions, isActive);

  return (
    <group>
      <ModelRenderer nodes={nodes} color={color} skeleton={skeleton} url={url} />
    </group>
  );
}
