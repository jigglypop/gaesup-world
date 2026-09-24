import { useLayoutEffect, useMemo, useRef } from 'react';

import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import type { MaterialManager } from '../../core/MaterialManager';
import type { BuildingWallKind, MeshConfig, WallConfig, WallGroupConfig } from '../../types';
import { useInstanceCapacity } from '../BuildingBatches/capacity';

export type WallBatch = {
  key: string;
  walls: WallConfig[];
  materials: THREE.Material[];
};

const DEFAULT_WALL_MESH: MeshConfig = { id: 'default', color: '#000000' };

export function getWallMaterialKey(wall: WallConfig): string {
  return wall.materialId ? `material:${wall.materialId}` : `type:${wall.wallGroupId}`;
}

export function getWallKind(wall: WallConfig, group: WallGroupConfig): BuildingWallKind {
  return wall.wallKind ?? group.defaultWallKind ?? 'solid';
}

export function getWallMaterials(
  manager: MaterialManager,
  meshes: Map<string, MeshConfig>,
  wall: WallConfig,
  wallGroups: Map<string, WallGroupConfig>,
  fallbackWallGroup: WallGroupConfig,
): THREE.Material[] {
  if (wall.materialId) {
    const material = manager.getMaterial(meshes.get(wall.materialId) ?? DEFAULT_WALL_MESH);
    return [material, material, material, material, material, material];
  }

  const wallType = wallGroups.get(wall.wallGroupId) ?? fallbackWallGroup;
  const frontMesh = wallType.frontMeshId ? meshes.get(wallType.frontMeshId) : DEFAULT_WALL_MESH;
  const backMesh = wallType.backMeshId ? meshes.get(wallType.backMeshId) : DEFAULT_WALL_MESH;
  const sideMesh = wallType.sideMeshId ? meshes.get(wallType.sideMeshId) : DEFAULT_WALL_MESH;
  const exteriorMesh = wall.flipSides ? backMesh : frontMesh;
  const interiorMesh = wall.flipSides ? frontMesh : backMesh;

  return [
    manager.getMaterial(sideMesh ?? DEFAULT_WALL_MESH),
    manager.getMaterial(sideMesh ?? DEFAULT_WALL_MESH),
    manager.getMaterial(sideMesh ?? DEFAULT_WALL_MESH),
    manager.getMaterial(sideMesh ?? DEFAULT_WALL_MESH),
    manager.getMaterial(exteriorMesh ?? DEFAULT_WALL_MESH),
    manager.getMaterial(interiorMesh ?? DEFAULT_WALL_MESH),
  ];
}

export function WallBatchMesh({
  batch,
  geometry,
  height,
  onWallClick,
}: {
  batch: WallBatch;
  geometry: THREE.BoxGeometry;
  height: number;
  onWallClick?: (wallId: string) => void;
}) {
  const instancedRef = useRef<THREE.InstancedMesh | null>(null);
  const wallCount = batch.walls.length;
  const capacity = useInstanceCapacity(wallCount);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  // Six identical face materials draw as one material: one draw instead of one per BoxGeometry group.
  const material = useMemo(
    () => (batch.materials.every((entry) => entry === batch.materials[0]) ? batch.materials[0]! : batch.materials),
    [batch.materials],
  );

  useLayoutEffect(() => {
    const mesh = instancedRef.current;
    if (!mesh) return;

    mesh.count = wallCount;
    for (let i = 0; i < wallCount; i++) {
      const wall = batch.walls[i];
      if (!wall) continue;
      dummy.position.set(wall.position.x, wall.position.y + height / 2, wall.position.z);
      dummy.rotation.set(0, wall.rotation.y, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (wallCount > 0) {
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    }
  }, [batch.walls, wallCount, dummy, height, capacity]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const wall = event.instanceId !== undefined ? batch.walls[event.instanceId] : undefined;
    if (wall) onWallClick?.(wall.id);
  };

  return (
    <instancedMesh
      name={`building-batch:wall:${batch.key}`}
      ref={instancedRef}
      args={[geometry, material, capacity]}
      castShadow
      receiveShadow
      {...(onWallClick ? { onClick: handleClick } : {})}
    />
  );
}
