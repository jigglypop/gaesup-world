import { useLayoutEffect, useRef } from 'react';

import * as THREE from 'three';

import type { TileConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import { useInstanceCapacity } from '../BuildingBatches/capacity';

export type BoxTileBatch = {
  key: string;
  tiles: TileConfig[];
  material: THREE.Material;
  /** Raised tiles cast shadows; ground-level tiles only receive them. */
  castShadow: boolean;
};

const GROUND_LEVEL = 0.02;

export function isRaisedTile(tile: TileConfig): boolean {
  return tile.position.y > GROUND_LEVEL;
}

/** Batch key for a box tile: its material plus whether it casts shadows. */
export function getBoxTileBatchKey(materialId: string, tile: TileConfig): string {
  return isRaisedTile(tile) ? `${materialId}:raised` : materialId;
}

export function BoxTileBatchMesh({
  batch,
  geometry,
  dummy,
}: {
  batch: BoxTileBatch;
  geometry: THREE.BufferGeometry;
  dummy: THREE.Object3D;
}) {
  const ref = useRef<THREE.InstancedMesh | null>(null);
  const capacity = useInstanceCapacity(batch.tiles.length);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;

    const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;
    mesh.count = batch.tiles.length;

    for (let i = 0; i < batch.tiles.length; i++) {
      const tile = batch.tiles[i];
      if (!tile) continue;
      const tileMultiplier = tile.size || 1;
      const tileSize = cellSize * tileMultiplier;

      dummy.position.set(tile.position.x, tile.position.y + 0.001, tile.position.z);
      dummy.rotation.set(0, tile.rotation ?? 0, 0);
      dummy.scale.set(tileSize, 1, tileSize);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (batch.tiles.length > 0) {
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    }
  }, [batch.tiles, dummy, capacity]);

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, batch.material, capacity]}
      name={`building-batch:tile:${batch.key}`}
      castShadow={batch.castShadow}
      receiveShadow
      frustumCulled
    />
  );
}
