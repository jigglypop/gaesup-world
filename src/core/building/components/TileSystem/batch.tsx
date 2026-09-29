import { useLayoutEffect, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { rendererKind } from '../../../rendering/webgpu';
import { tileWorldSize } from '../../model/footprint';
import { groundMaterial } from '../../terrain/groundMaterial';
import type { TileConfig } from '../../types';
import { useInstanceCapacity } from '../BuildingBatches/capacity';

export type BoxTileBatch = {
  key: string;
  tiles: TileConfig[];
  material: THREE.Material;
  /** Raised tiles cast shadows; ground-level tiles only receive them. */
  castShadow: boolean;
  /** The mesh grows a grass layer, which shades the tile tops under it. */
  grass?: boolean;
};

const GROUND_LEVEL = 0.02;
/** Tiles are ground: a camera in `collisionMode: 'fade'` stops in front of them instead of seeing through. */
const GROUND_USER_DATA = { cameraCollisionMode: 'push' };

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
  // Node renderers draw tile tops with world-space texture coordinates and broad tint patches.
  const nodeRenderer = useThree((state) => rendererKind(state.gl) !== 'webgl');
  const material = nodeRenderer ? groundMaterial(batch.material, batch.grass) : batch.material;

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;

    mesh.count = batch.tiles.length;

    for (let i = 0; i < batch.tiles.length; i++) {
      const tile = batch.tiles[i];
      if (!tile) continue;
      const tileSize = tileWorldSize(tile);

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
      args={[geometry, material, capacity]}
      name={`building-batch:tile:${batch.key}`}
      castShadow={batch.castShadow}
      receiveShadow
      frustumCulled
      userData={GROUND_USER_DATA}
    />
  );
}
