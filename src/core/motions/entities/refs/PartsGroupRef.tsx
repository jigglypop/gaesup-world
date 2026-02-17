import { useEffect, useMemo } from 'react';

import { useGLTF } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { useAnimationPlayer } from '@hooks/useAnimationPlayer';

import { ModelRendererProps, PartsGroupRefProps } from './types';

export function ModelRenderer({ nodes, color, skeleton, url, excludeNodeNames }: ModelRendererProps) {
  type NodeData =
    | {
        type: 'skinnedMesh';
        material: THREE.Material | THREE.Material[];
        geometry: THREE.BufferGeometry;
        skeleton: THREE.Skeleton;
        key: string;
      }
    | {
        type: 'mesh';
        material: THREE.Material | THREE.Material[];
        geometry: THREE.BufferGeometry;
        key: string;
      };

  const { processedNodes, ownedMaterials } = useMemo(() => {
    const owned: THREE.Material[] = [];
    const exclude =
      excludeNodeNames && excludeNodeNames.length > 0
        ? new Set(excludeNodeNames)
        : null;

    const tint = (mat: THREE.Material): THREE.Material => {
      const cloned = mat.clone();
      owned.push(cloned);
      if (color && 'color' in cloned && cloned.color instanceof THREE.Color) {
        cloned.color.set(color);
      }
      return cloned;
    };

    const resolveMaterial = (mat: THREE.Material | THREE.Material[]) => {
      // If no per-instance color is requested, do not clone. This keeps memory usage down.
      // We also set `dispose={null}` on rendered meshes to avoid R3F disposing shared GLTF assets.
      if (!color) return mat;
      return Array.isArray(mat) ? mat.map((m) => tint(m)) : tint(mat);
    };

    const processed = Object.keys(nodes)
      .map((name: string, key: number) => {
        if (exclude && exclude.has(name)) return null;
        const node = nodes[name];
        if (node instanceof THREE.SkinnedMesh) {
          const material = resolveMaterial(node.material);

          return {
            type: 'skinnedMesh' as const,
            material,
            geometry: node.geometry,
            skeleton: skeleton || node.skeleton,
            key: `${url}-${name}-${key}`,
          };
        } else if (node instanceof THREE.Mesh) {
          const material = resolveMaterial(node.material);

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

    return {
      processedNodes: processed as unknown as NodeData[],
      ownedMaterials: owned,
    };
  }, [nodes, color, skeleton, url, excludeNodeNames]);

  useEffect(() => {
    return () => {
      for (const m of ownedMaterials) {
        m.dispose();
      }
    };
  }, [ownedMaterials]);

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
              dispose={null}
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
              dispose={null}
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
