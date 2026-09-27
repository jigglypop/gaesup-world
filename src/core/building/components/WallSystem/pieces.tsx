import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import { createWallPartsGeometry, faceMaterial, getWallMaterials } from './batch';
import type { MaterialManager } from '../../core/MaterialManager';
import { wallBox, wallKindOf, wallPieces, type WallPiece } from '../../model/footprint';
import type { BuildingWallKind, MeshConfig, WallConfig, WallGroupConfig } from '../../types';
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

/**
 * Every wall of one kind whose pieces of one role (a window's four frame bars, a door's leaf) share a material: one
 * InstancedMesh drawing all those pieces as one geometry.
 */
export type WallPieceBatch = {
  key: string;
  role: WallPiece['role'];
  pieces: readonly WallPiece[];
  walls: WallConfig[];
  material: THREE.Material | THREE.Material[];
};

const materialKey = (material: THREE.Material | THREE.Material[]) =>
  Array.isArray(material) ? material.map((entry) => entry.uuid).join('|') : material.uuid;

const ROLES: readonly WallPiece['role'][] = ['frame', 'glass', 'door'];
const rolePieces = new Map<string, readonly WallPiece[]>();

/** The pieces of one role of a wall kind: the same array every time, so a batch keeps its geometry across edits. */
function piecesOf(kind: BuildingWallKind, role: WallPiece['role']): readonly WallPiece[] {
  const shape = `${kind}:${role}`;
  let pieces = rolePieces.get(shape);
  if (!pieces) rolePieces.set(shape, pieces = wallPieces(kind).filter((piece) => piece.role === role));
  return pieces;
}

/** The frames, glass and doors of the non-solid walls, grouped by kind, role and material. */
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
    for (const role of ROLES) {
      const pieces = piecesOf(kind, role);
      if (pieces.length === 0) continue;
      const material = byRole[role];
      const key = `${kind}:${role}:${materialKey(material)}`;
      let batch = batches.get(key);
      if (!batch) batches.set(key, batch = { key, role, pieces, walls: [], material });
      batch.walls.push(wall);
    }
  }
  return [...batches.values()];
}

const wallMatrix = new THREE.Matrix4();

/** The pieces of many walls, each set placed where its wall stands. A click selects the wall of the piece hit. */
export function WallPieceBatchMesh({ batch, onWallClick }: { batch: WallPieceBatch; onWallClick?: (wallId: string) => void }) {
  const ref = useRef<THREE.InstancedMesh | null>(null);
  const capacity = useInstanceCapacity(batch.walls.length);
  // The pieces sit in the wall's frame, so an instance is the wall's own transform.
  const geometry = useMemo(() => createWallPartsGeometry(batch.pieces), [batch.pieces]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    batch.walls.forEach((wall, index) => {
      const { center, rotationY } = wallBox(wall);
      wallMatrix.makeRotationY(rotationY).setPosition(center[0], wall.position.y, center[2]);
      mesh.setMatrixAt(index, wallMatrix);
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
      castShadow={batch.role !== 'glass'}
      receiveShadow
      {...(onWallClick ? { onClick: handleClick } : {})}
    />
  );
}
