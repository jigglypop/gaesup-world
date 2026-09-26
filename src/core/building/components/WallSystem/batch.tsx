import { useLayoutEffect, useMemo, useRef } from 'react';

import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import type { MaterialManager } from '../../core/MaterialManager';
import { wallBox } from '../../model/footprint';
import type { BuildingWallKind, MeshConfig, WallConfig, WallGroupConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import { useInstanceCapacity } from '../BuildingBatches/capacity';

export type WallBatch = {
  key: string;
  walls: WallConfig[];
  materials: THREE.Material[];
};

const DEFAULT_WALL_MESH: MeshConfig = { id: 'default', color: '#000000' };

/** A wall centered on its own box; each instance moves it to `wallBox(wall)`. */
export function createWallGeometry(): THREE.BoxGeometry {
  const { WIDTH, HEIGHT, THICKNESS } = TILE_CONSTANTS.WALL_SIZES;
  return new THREE.BoxGeometry(WIDTH, HEIGHT, THICKNESS);
}

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
  onWallClick,
}: {
  batch: WallBatch;
  geometry: THREE.BoxGeometry;
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
      const { center, rotationY } = wallBox(wall);
      dummy.position.set(center[0], center[1], center[2]);
      dummy.rotation.set(0, rotationY, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (wallCount > 0) {
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    }
  }, [batch.walls, wallCount, dummy, capacity]);

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
