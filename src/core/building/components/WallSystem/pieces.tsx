import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import { faceMaterial, getWallMaterials } from './batch';
import type { MaterialManager } from '../../core/MaterialManager';
import { wallBox, wallKindOf, wallPieces, type WallPiece } from '../../model/footprint';
import type { MeshConfig, WallConfig, WallGroupConfig } from '../../types';
import { useInstanceCapacity } from '../BuildingBatches/capacity';

const DEFAULT_GLASS_MESH: MeshConfig = {
  id: 'default-window-glass',
  color: '#9ed8ff',
  material: 'GLASS',
  opacity: 0.42,
  transparent: true,
  roughness: 0.08,
};
const DEFAULT_DOOR_MESH: MeshConfig = { id: 'default-door-panel', color: '#7a5232', roughness: 0.78 };

function getDoorMaterial(manager: MaterialManager, meshes: Map<string, MeshConfig>, wallGroup: WallGroupConfig): THREE.Material {
  const base = wallGroup.frontMeshId ? meshes.get(wallGroup.frontMeshId) : undefined;
  return manager.getMaterial({
    ...DEFAULT_DOOR_MESH,
    color: base?.color ? new THREE.Color(base.color).multiplyScalar(0.72).getStyle() : '#7a5232',
  });
}

/** Every wall with the same piece of the same shape and material: one InstancedMesh of that piece. */
export type WallPieceBatch = {
  key: string;
  piece: WallPiece;
  walls: WallConfig[];
  material: THREE.Material | THREE.Material[];
};

const materialKey = (material: THREE.Material | THREE.Material[]) =>
  Array.isArray(material) ? material.map((entry) => entry.uuid).join('|') : material.uuid;

/** The frames, glass and doors of the non-solid walls, grouped by piece and material. */
export function buildWallPieceBatches(
  walls: readonly { wall: WallConfig; group: WallGroupConfig }[],
  wallGroups: Map<string, WallGroupConfig>,
  meshes: Map<string, MeshConfig>,
  manager: MaterialManager,
): WallPieceBatch[] {
  const batches = new Map<string, WallPieceBatch>();
  for (const { wall, group } of walls) {
    const kind = wallKindOf(wall, group);
    if (kind === 'solid') continue;
    const byRole = {
      frame: faceMaterial(getWallMaterials(manager, meshes, wall, wallGroups, group)),
      glass: manager.getMaterial(DEFAULT_GLASS_MESH),
      door: getDoorMaterial(manager, meshes, group),
    };
    for (const piece of wallPieces(kind)) {
      const material = byRole[piece.role];
      const key = `${kind}:${piece.key}:${materialKey(material)}`;
      let batch = batches.get(key);
      if (!batch) batches.set(key, batch = { key, piece, walls: [], material });
      batch.walls.push(wall);
    }
  }
  return [...batches.values()];
}

const pieceMatrix = new THREE.Matrix4();
const pieceOffset = new THREE.Matrix4();

/** One piece of many walls, each placed where the wall stands. A click selects the wall of the piece hit. */
export function WallPieceBatchMesh({ batch, onWallClick }: { batch: WallPieceBatch; onWallClick?: (wallId: string) => void }) {
  const ref = useRef<THREE.InstancedMesh | null>(null);
  const capacity = useInstanceCapacity(batch.walls.length);
  const [width, height, depth] = batch.piece.size;
  const geometry = useMemo(() => new THREE.BoxGeometry(width, height, depth), [width, height, depth]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const [x, y, z] = batch.piece.position;
    pieceOffset.makeTranslation(x, y, z);
    batch.walls.forEach((wall, index) => {
      const { center, rotationY } = wallBox(wall);
      pieceMatrix.makeRotationY(rotationY).setPosition(center[0], wall.position.y, center[2]).multiply(pieceOffset);
      mesh.setMatrixAt(index, pieceMatrix);
    });
    mesh.count = batch.walls.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
  }, [batch, capacity]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const wall = event.instanceId !== undefined ? batch.walls[event.instanceId] : undefined;
    if (wall) onWallClick?.(wall.id);
  };

  return (
    <instancedMesh
      name={`building-batch:wall-piece:${batch.key}`}
      ref={ref}
      args={[geometry, batch.material, capacity]}
      // Glass lets the sun through; an opaque shadow would black out the room behind it.
      castShadow={batch.piece.role !== 'glass'}
      receiveShadow
      {...(onWallClick ? { onClick: handleClick } : {})}
    />
  );
}
