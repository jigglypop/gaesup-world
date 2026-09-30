import { useLayoutEffect, useMemo, useRef } from 'react';

import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import type { MaterialManager } from '../../core/MaterialManager';
import { wallBox } from '../../model/footprint';
import type { MeshConfig, WallConfig, WallGroupConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import { useInstanceCapacity } from '../BuildingBatches/capacity';

export type WallBatch = {
  key: string;
  walls: WallConfig[];
  materials: THREE.Material[];
};

const DEFAULT_WALL_MESH: MeshConfig = { id: 'default', color: '#000000' };

/** Index ranges of a box's faces in three's order (+x, −x, +y, −y, +z, −z), by the wall material each one takes. */
const FACE_GROUPS = [
  { from: 0, to: 24, materialIndex: 0 },
  { from: 24, to: 30, materialIndex: 4 },
  { from: 30, to: 36, materialIndex: 5 },
] as const;

/**
 * Boxes, each moved to its `position`, as one geometry of three groups: every box's four edge faces, then the fronts
 * (+z), then the backs (−z). `getWallMaterials` gives all edges one material, so a batch draws three times a pass
 * (shadow passes too) instead of six times per box.
 */
export function createWallPartsGeometry(
  boxes: readonly { size: readonly [number, number, number]; position?: readonly [number, number, number] }[],
): THREE.BufferGeometry {
  const parts = boxes.map(({ size, position }) => {
    const box = new THREE.BoxGeometry(size[0], size[1], size[2]);
    if (position) box.translate(position[0], position[1], position[2]);
    return box;
  });
  const geometry = new THREE.BufferGeometry();
  const vertices = parts.reduce((sum, part) => sum + part.getAttribute('position').count, 0);
  for (const name of ['position', 'normal', 'uv']) {
    const itemSize = parts[0]!.getAttribute(name).itemSize;
    const array = new Float32Array(vertices * itemSize);
    let offset = 0;
    for (const part of parts) {
      array.set(part.getAttribute(name).array, offset);
      offset += part.getAttribute(name).array.length;
    }
    geometry.setAttribute(name, new THREE.BufferAttribute(array, itemSize));
  }
  const index: number[] = [];
  for (const { from, to, materialIndex } of FACE_GROUPS) {
    const start = index.length;
    let base = 0;
    for (const part of parts) {
      const source = part.index!.array;
      for (let i = from; i < to; i++) index.push(source[i]! + base);
      base += part.getAttribute('position').count;
    }
    geometry.addGroup(start, index.length - start, materialIndex);
  }
  geometry.setIndex(index);
  for (const part of parts) part.dispose();
  return geometry;
}

/** A wall centered on its own box; each instance moves it to `wallBox(wall)`. */
export function createWallGeometry(): THREE.BufferGeometry {
  const { WIDTH, HEIGHT, THICKNESS } = TILE_CONSTANTS.WALL_SIZES;
  return createWallPartsGeometry([{ size: [WIDTH, HEIGHT, THICKNESS] }]);
}

export function getWallMaterialKey(wall: WallConfig): string {
  return wall.materialId ? `material:${wall.materialId}` : `type:${wall.wallGroupId}`;
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

/** Six identical face materials draw as one material: one draw instead of one per geometry group. */
export function faceMaterial(materials: THREE.Material[]): THREE.Material | THREE.Material[] {
  return materials.every((entry) => entry === materials[0]) ? materials[0]! : materials;
}

export function WallBatchMesh({
  batch,
  geometry,
  onWallClick,
}: {
  batch: WallBatch;
  geometry: THREE.BufferGeometry;
  onWallClick?: (wallId: string) => void;
}) {
  const instancedRef = useRef<THREE.InstancedMesh | null>(null);
  const wallCount = batch.walls.length;
  const capacity = useInstanceCapacity(wallCount);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const material = useMemo(() => faceMaterial(batch.materials), [batch.materials]);

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
