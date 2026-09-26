import { memo, useEffect, useMemo, useState } from 'react';

import { createWallGeometry, getWallMaterialKey, getWallMaterials, WallBatchMesh, type WallBatch } from './batch';
import { createWallColliders } from './colliders';
import { buildWallPieceBatches, WallPieceBatchMesh, type WallPieceBatch } from './pieces';
import { WallSystemProps } from './types';
import { MaterialManager } from '../../core/MaterialManager';
import { wallKindOf } from '../../model/footprint';
import { MeshConfig, WallConfig, WallGroupConfig } from '../../types';
import { BuildingColliderBody } from '../BuildingColliders';
import type { BuildingColliderBox } from '../BuildingColliders/types';
import { EditOverlay } from '../EditOverlay';
import { wallEditItem, type EditOverlayItem } from '../EditOverlay/items';

export { getWallMaterialKey };

const EMPTY_COLLIDER_BOXES: readonly BuildingColliderBox[] = [];
const NO_EDIT_ITEMS: EditOverlayItem[] = [];
const NO_BATCHES: WallBatch[] = [];
const NO_PIECE_BATCHES: WallPieceBatch[] = [];
function isBatchedWall(wall: WallConfig, group: WallGroupConfig): boolean {
  return wallKindOf(wall, group) === 'solid';
}

function buildWallBatches(
  wallGroup: WallGroupConfig,
  wallGroups: Map<string, WallGroupConfig>,
  meshes: Map<string, MeshConfig>,
  manager: MaterialManager,
): WallBatch[] {
  const grouped = new Map<string, WallConfig[]>();
  for (const wall of wallGroup.walls) {
    if (!isBatchedWall(wall, wallGroup)) continue;
    const key = getWallMaterialKey(wall);
    const walls = grouped.get(key) ?? [];
    walls.push(wall);
    grouped.set(key, walls);
  }

  return Array.from(grouped.entries()).map(([key, walls]) => {
    const firstWall = walls[0];
    return {
      key,
      walls,
      materials: firstWall
        ? getWallMaterials(manager, meshes, firstWall, wallGroups, wallGroup)
        : getWallMaterials(manager, meshes, { id: '', wallGroupId: wallGroup.id, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }, wallGroups, wallGroup),
    };
  });
}

/** Memoized: a building re-render for another group, a selection or a new mesh leaves unchanged groups alone. */
export const WallSystem = memo(function WallSystem({
  wallGroup,
  wallGroups,
  meshes,
  isEditMode = false,
  selectedWallId = null,
  onWallClick,
  colliders = true,
  batches: renderBatches = true,
}: WallSystemProps) {
  const [materialManager] = useState(() => new MaterialManager());

  const geometry = useMemo(createWallGeometry, []);

  const batches = useMemo(
    () => (renderBatches ? buildWallBatches(wallGroup, wallGroups ?? new Map([[wallGroup.id, wallGroup]]), meshes, materialManager) : NO_BATCHES),
    [materialManager, renderBatches, wallGroup, wallGroups, meshes],
  );
  // Windows, doors and railings: one InstancedMesh per piece and material instead of a mesh per piece.
  const pieceBatches = useMemo(
    () => (renderBatches
      ? buildWallPieceBatches(wallGroup.walls.map((wall) => ({ wall, group: wallGroup })), wallGroups ?? new Map([[wallGroup.id, wallGroup]]), meshes, materialManager)
      : NO_PIECE_BATCHES),
    [materialManager, renderBatches, wallGroup, wallGroups, meshes],
  );

  useEffect(() => {
    return () => {
      materialManager.dispose();
      geometry.dispose();
    };
  }, [geometry]);

  const colliderBoxes = useMemo(
    () => (colliders && !isEditMode ? createWallColliders(wallGroup) : EMPTY_COLLIDER_BOXES),
    [colliders, isEditMode, wallGroup],
  );
  const editItems = useMemo(
    () => (isEditMode ? wallGroup.walls.map(wallEditItem) : NO_EDIT_ITEMS),
    [isEditMode, wallGroup.walls],
  );

  return (
    <>
      <BuildingColliderBody boxes={colliderBoxes} />

      {isEditMode && <EditOverlay kind="marker" items={editItems} selectedId={selectedWallId} onSelect={onWallClick} />}

      {renderBatches && batches.map((batch) => (
        <WallBatchMesh
          key={`${wallGroup.id}-${batch.key}`}
          batch={batch}
          geometry={geometry}
          {...(onWallClick ? { onWallClick } : {})}
        />
      ))}
      {pieceBatches.map((batch) => (
        <WallPieceBatchMesh key={`${wallGroup.id}-${batch.key}`} batch={batch} {...(onWallClick ? { onWallClick } : {})} />
      ))}
    </>
  );
});
