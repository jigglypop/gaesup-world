import { memo, useEffect, useMemo, useState } from 'react';

import * as THREE from 'three';

import { getDefaultToonMode, getToonGradient } from '../../../rendering/toon';
import { MaterialManager } from '../../core/MaterialManager';
import { sameItems, useReusedByKey } from '../../hooks/useReusedByKey';
import { wallKindOf } from '../../model/footprint';
import type { MeshConfig, TileGroupConfig, WallGroupConfig } from '../../types';
import { BoxTileBatchMesh, getBoxTileBatchKey, isRaisedTile, type BoxTileBatch } from '../TileSystem/batch';
import { getTileShape } from '../TileSystem/layout';
import { createWallGeometry, getWallMaterials, WallBatchMesh, type WallBatch } from '../WallSystem/batch';

export type BuildingBatchesProps = {
  tileGroups: readonly TileGroupConfig[];
  wallGroups: readonly WallGroupConfig[];
  /** Every wall group, used to resolve a wall's type materials. */
  wallGroupMap: Map<string, WallGroupConfig>;
  meshes: Map<string, MeshConfig>;
  onWallClick?: (wallId: string) => void;
};

const sameTileBatch = (a: BoxTileBatch, b: BoxTileBatch) =>
  a.material === b.material && a.castShadow === b.castShadow && sameItems(a.tiles, b.tiles);
const sameWallBatch = (a: WallBatch, b: WallBatch) => sameItems(a.materials, b.materials) && sameItems(a.walls, b.walls);

/**
 * World-level instanced batches. Every box tile and solid wall that resolves to the same materials is one
 * InstancedMesh (one draw, one GPU batch) however many groups it spans; groups keep rendering everything else.
 */
export const BuildingBatches = memo(function BuildingBatches({
  tileGroups,
  wallGroups,
  wallGroupMap,
  meshes,
  onWallClick,
}: BuildingBatchesProps) {
  const [manager] = useState(() => new MaterialManager());
  const resources = useMemo(() => ({
    fallback: getDefaultToonMode()
      ? new THREE.MeshToonMaterial({ color: '#888888', gradientMap: getToonGradient(4) })
      : new THREE.MeshStandardMaterial({ color: '#888888' }),
    tileGeometry: new THREE.PlaneGeometry(1, 1, 1, 1).rotateX(-Math.PI / 2),
    wallGeometry: createWallGeometry(),
    dummy: new THREE.Object3D(),
  }), []);
  useEffect(() => () => {
    resources.fallback.dispose();
    resources.tileGeometry.dispose();
    resources.wallGeometry.dispose();
  }, [resources]);
  useEffect(() => () => manager.dispose(), [manager]);

  // Every edit regroups the world; batches it left alone stay the same objects and keep their instance matrices.
  const tileBatches = useReusedByKey(useMemo(() => {
    const byMaterial = new Map<string, BoxTileBatch>();
    for (const group of tileGroups) {
      for (const tile of group.tiles) {
        if (getTileShape(tile) !== 'box') continue;
        const mesh = (tile.materialId ? meshes.get(tile.materialId) : undefined) ?? meshes.get(group.floorMeshId);
        const key = getBoxTileBatchKey(mesh?.id ?? 'default', tile);
        let batch = byMaterial.get(key);
        if (!batch) {
          const material = mesh ? manager.getMaterial(mesh) : resources.fallback;
          batch = { key, tiles: [], material, castShadow: isRaisedTile(tile) };
          byMaterial.set(key, batch);
        }
        batch.tiles.push(tile);
      }
    }
    return [...byMaterial.values()];
  }, [manager, meshes, resources, tileGroups]), sameTileBatch);

  const wallBatches = useReusedByKey(useMemo(() => {
    const byMaterials = new Map<string, WallBatch>();
    for (const group of wallGroups) {
      for (const wall of group.walls) {
        if (wallKindOf(wall, group) !== 'solid') continue;
        const materials = getWallMaterials(manager, meshes, wall, wallGroupMap, group);
        const key = materials.map((material) => material.uuid).join('|');
        let batch = byMaterials.get(key);
        if (!batch) {
          batch = { key, walls: [], materials };
          byMaterials.set(key, batch);
        }
        batch.walls.push(wall);
      }
    }
    return [...byMaterials.values()];
  }, [manager, meshes, wallGroupMap, wallGroups]), sameWallBatch);

  return (
    <>
      {tileBatches.map((batch) => (
        <BoxTileBatchMesh key={batch.key} batch={batch} geometry={resources.tileGeometry} dummy={resources.dummy} />
      ))}
      {wallBatches.map((batch) => (
        <WallBatchMesh
          key={batch.key}
          batch={batch}
          geometry={resources.wallGeometry}
          {...(onWallClick ? { onWallClick } : {})}
        />
      ))}
    </>
  );
});
