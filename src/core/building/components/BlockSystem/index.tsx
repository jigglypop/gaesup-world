import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { CuboidCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import type { BlockSystemProps } from './types';
import { MaterialManager } from '../../core/MaterialManager';
import type { BuildingBlockConfig, MeshConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';

type BlockBatch = {
  key: string;
  blocks: BuildingBlockConfig[];
  material: THREE.Material;
};

type BlockTransform = {
  position: [number, number, number];
  scale: [number, number, number];
};

const DEFAULT_BLOCK_MESH: MeshConfig = {
  id: 'default-block',
  color: '#8b8174',
  material: 'STANDARD',
  roughness: 0.92,
};

function getBlockDimensions(block: BuildingBlockConfig): { width: number; height: number; depth: number } {
  return {
    width: Math.max(1, Math.round(block.size?.x ?? 1)) * TILE_CONSTANTS.GRID_CELL_SIZE,
    height: Math.max(1, Math.round(block.size?.y ?? 1)) * TILE_CONSTANTS.HEIGHT_STEP,
    depth: Math.max(1, Math.round(block.size?.z ?? 1)) * TILE_CONSTANTS.GRID_CELL_SIZE,
  };
}

function getBlockTransform(block: BuildingBlockConfig): BlockTransform {
  const { width, height, depth } = getBlockDimensions(block);
  return {
    position: [
      block.position.x - TILE_CONSTANTS.GRID_CELL_SIZE * 0.5 + width * 0.5,
      block.position.y + height * 0.5,
      block.position.z - TILE_CONSTANTS.GRID_CELL_SIZE * 0.5 + depth * 0.5,
    ],
    scale: [width, height, depth],
  };
}

export function BlockSystem({
  blocks,
  meshes,
  isEditMode = false,
  selectedBlockId = null,
  onBlockClick,
}: BlockSystemProps) {
  const materialManagerRef = useRef<MaterialManager>(new MaterialManager());
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const editMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#60a5fa',
        transparent: true,
        opacity: 0.34,
        emissive: new THREE.Color('#2563eb'),
        emissiveIntensity: 0.08,
      }),
    [],
  );
  const selectedEditMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#bae6fd',
        transparent: true,
        opacity: 0.48,
        emissive: new THREE.Color('#60a5fa'),
        emissiveIntensity: 0.2,
      }),
    [],
  );

  const batches = useMemo<BlockBatch[]>(() => {
    const byMaterial = new Map<string, BuildingBlockConfig[]>();
    for (const block of blocks) {
      const key = block.materialId ?? DEFAULT_BLOCK_MESH.id;
      const list = byMaterial.get(key) ?? [];
      list.push(block);
      byMaterial.set(key, list);
    }

    const manager = materialManagerRef.current;
    return Array.from(byMaterial.entries()).map(([key, batchBlocks]) => ({
      key,
      blocks: batchBlocks,
      material: manager.getMaterial(meshes.get(key) ?? { ...DEFAULT_BLOCK_MESH, id: key }),
    }));
  }, [blocks, meshes]);

  useEffect(() => {
    return () => {
      materialManagerRef.current.dispose();
      geometry.dispose();
      editMaterial.dispose();
      selectedEditMaterial.dispose();
    };
  }, [editMaterial, geometry, selectedEditMaterial]);

  return (
    <>
      {!isEditMode && blocks.length > 0 && (
        <RigidBody type="fixed" colliders={false}>
          {blocks.map((block) => {
            const transform = getBlockTransform(block);
            return (
              <CuboidCollider
                key={block.id}
                position={transform.position}
                args={[
                  transform.scale[0] * 0.5,
                  transform.scale[1] * 0.5,
                  transform.scale[2] * 0.5,
                ]}
              />
            );
          })}
        </RigidBody>
      )}

      {batches.map((batch) => (
        <BlockBatchMesh
          key={batch.key}
          batch={batch}
          geometry={geometry}
          dummy={dummy}
        />
      ))}

      {isEditMode && blocks.map((block) => {
        const transform = getBlockTransform(block);
        const selected = block.id === selectedBlockId;
        return (
          <mesh
            key={`${block.id}-edit`}
            name={`block-edit-${block.id}`}
            position={transform.position}
            scale={[
              transform.scale[0] * 0.82,
              transform.scale[1] * 0.82,
              transform.scale[2] * 0.82,
            ]}
            geometry={geometry}
            material={selected ? selectedEditMaterial : editMaterial}
            onClick={() => onBlockClick?.(block.id)}
          />
        );
      })}
    </>
  );
}

function BlockBatchMesh({
  batch,
  geometry,
  dummy,
}: {
  batch: BlockBatch;
  geometry: THREE.BoxGeometry;
  dummy: THREE.Object3D;
}) {
  const ref = useRef<THREE.InstancedMesh | null>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.count = batch.blocks.length;

    for (let i = 0; i < batch.blocks.length; i += 1) {
      const block = batch.blocks[i];
      if (!block) continue;
      const transform = getBlockTransform(block);
      dummy.position.set(...transform.position);
      dummy.scale.set(...transform.scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (batch.blocks.length > 0) {
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    }
  }, [batch.blocks, dummy]);

  return (
    <instancedMesh
      ref={ref}
      name={`block-system-${batch.key}`}
      args={[geometry, batch.material, Math.max(1, batch.blocks.length)]}
      castShadow
      receiveShadow
    />
  );
}
