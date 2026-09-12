import { useEffect, useMemo } from 'react';

import { useGLTF } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { useAnimationPlayer } from '@hooks/useAnimationPlayer';

import { ModelRendererProps, PartsGroupRefProps } from './types';
import { RigidPartRef } from './RigidPartRef';
import { resolveSharedSkeletonBinding } from '../../../character/skeleton';

export function ModelRenderer({ nodes, color, colorNodeNames, skeleton, url, excludeNodeNames }: ModelRendererProps) {
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

  const { processedNodes, ownedMaterials, ownedGeometries } = useMemo(() => {
    const owned: THREE.Material[] = [];
    const ownedGeo: THREE.BufferGeometry[] = [];
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

    const tintable = colorNodeNames && colorNodeNames.length > 0 ? new Set(colorNodeNames) : null;

    const resolveMaterial = (mat: THREE.Material | THREE.Material[], nodeName: string) => {
      // If no per-instance color is requested, do not clone. This keeps memory usage down.
      // We also set `dispose={null}` on rendered meshes to avoid R3F disposing shared GLTF assets.
      if (!color) return mat;
      if (tintable && !tintable.has(nodeName)) return mat;
      return Array.isArray(mat) ? mat.map((m) => tint(m)) : tint(mat);
    };

    const processed = Object.keys(nodes)
      .map((name: string, key: number) => {
        if (exclude && exclude.has(name)) return null;
        const node = nodes[name];
        if (node instanceof THREE.SkinnedMesh) {
          const material = resolveMaterial(node.material, name);
          // Sharing the character skeleton is only safe when joint indices agree;
          // remap them when the same bones are ordered differently, and fall back
          // to the mesh's own skeleton when the rig contract is broken.
          const binding = resolveSharedSkeletonBinding(node, skeleton, url);
          if (binding.ownsGeometry) ownedGeo.push(binding.geometry);

          return {
            type: 'skinnedMesh' as const,
            material,
            geometry: binding.geometry,
            skeleton: binding.skeleton,
            key: `${url}-${name}-${key}`,
          };
        } else if (node instanceof THREE.Mesh) {
          const material = resolveMaterial(node.material, name);

          return {
            type: 'mesh' as const,
            material,
            geometry: node.geometry,
            key: `${url}-${name}-${key}`,
          };
        }
        return null;
      })
      .filter((node): node is NodeData => node !== null);

    return {
      processedNodes: processed,
      ownedMaterials: owned,
      ownedGeometries: ownedGeo,
    };
  }, [nodes, color, colorNodeNames, skeleton, url, excludeNodeNames]);

  useEffect(() => {
    return () => {
      for (const m of ownedMaterials) {
        m.dispose();
      }
      for (const g of ownedGeometries) {
        g.dispose();
      }
    };
  }, [ownedMaterials, ownedGeometries]);

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

function PartAnimationDriver() {
  useAnimationPlayer(true);
  return null;
}

export function PartsGroupRef(props: PartsGroupRefProps) {
  return props.attachment
    ? <RigidPartRef {...props} attachment={props.attachment} />
    : <SkinnedPartRef {...props} />;
}

function SkinnedPartRef({ url, isActive, color, skeleton }: PartsGroupRefProps) {
  const { scene } = useGLTF(url) as { scene: THREE.Object3D };
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);
  return (
    <group>
      {isActive && <PartAnimationDriver />}
      <ModelRenderer
        nodes={nodes}
        url={url}
        {...(color ? { color } : {})}
        {...(skeleton ? { skeleton } : {})}
      />
    </group>
  );
}
