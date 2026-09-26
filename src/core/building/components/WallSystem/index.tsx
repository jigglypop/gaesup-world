import { memo, useEffect, useMemo, useState } from 'react';

import * as THREE from 'three';

import { createWallGeometry, getWallMaterialKey, getWallMaterials, WallBatchMesh, type WallBatch } from './batch';
import { createWallColliders } from './colliders';
import { WallSystemProps } from './types';
import { MaterialManager } from '../../core/MaterialManager';
import { wallBox, wallKindOf, wallPieces } from '../../model/footprint';
import { MeshConfig, WallConfig, WallGroupConfig } from '../../types';
import { BuildingColliderBody } from '../BuildingColliders';
import type { BuildingColliderBox } from '../BuildingColliders/types';
import { EditOverlay } from '../EditOverlay';
import { wallEditItem, type EditOverlayItem } from '../EditOverlay/items';

export { getWallMaterialKey };

const EMPTY_COLLIDER_BOXES: readonly BuildingColliderBox[] = [];
const NO_EDIT_ITEMS: EditOverlayItem[] = [];
const NO_BATCHES: WallBatch[] = [];
const DEFAULT_GLASS_MESH: MeshConfig = {
  id: 'default-window-glass',
  color: '#9ed8ff',
  material: 'GLASS',
  opacity: 0.42,
  transparent: true,
  roughness: 0.08,
};
const DEFAULT_DOOR_MESH: MeshConfig = { id: 'default-door-panel', color: '#7a5232', roughness: 0.78 };

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

function getGlassMaterial(manager: MaterialManager): THREE.Material {
  return manager.getMaterial(DEFAULT_GLASS_MESH);
}

function getDoorMaterial(manager: MaterialManager, meshes: Map<string, MeshConfig>, wallGroup: WallGroupConfig): THREE.Material {
  const base = wallGroup.frontMeshId ? meshes.get(wallGroup.frontMeshId) : undefined;
  return manager.getMaterial({
    ...DEFAULT_DOOR_MESH,
    color: base?.color ? new THREE.Color(base.color).multiplyScalar(0.72).getStyle() : '#7a5232',
  });
}

function WallPiece({
  position,
  size,
  materials,
}: {
  position: [number, number, number];
  size: [number, number, number];
  materials: THREE.Material | THREE.Material[];
}) {
  return (
    <mesh position={position} material={materials} castShadow receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}

function WallModule({
  wall,
  wallGroup,
  wallGroups,
  meshes,
  manager,
  onWallClick,
}: {
  wall: WallConfig;
  wallGroup: WallGroupConfig;
  wallGroups: Map<string, WallGroupConfig>;
  meshes: Map<string, MeshConfig>;
  manager: MaterialManager;
  onWallClick?: (wallId: string) => void;
}) {
  const { center, rotationY } = wallBox(wall);
  const byRole = {
    frame: getWallMaterials(manager, meshes, wall, wallGroups, wallGroup),
    glass: getGlassMaterial(manager),
    door: getDoorMaterial(manager, meshes, wallGroup),
  };
  const handleClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onWallClick?.(wall.id);
  };

  return (
    <group
      position={[center[0], wall.position.y, center[2]]}
      rotation={[0, rotationY, 0]}
      {...(onWallClick ? { onClick: handleClick } : {})}
    >
      {wallPieces(wallKindOf(wall, wallGroup)).map((piece) => (
        <WallPiece key={piece.key} position={[...piece.position]} size={[...piece.size]} materials={byRole[piece.role]} />
      ))}
    </group>
  );
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
  const moduleWallGroups = wallGroups ?? new Map([[wallGroup.id, wallGroup]]);
  const moduleWalls = useMemo(
    () => wallGroup.walls.filter((wall) => !isBatchedWall(wall, wallGroup)),
    [wallGroup],
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
      {moduleWalls.map((wall) => (
        <WallModule
          key={wall.id}
          wall={wall}
          wallGroup={wallGroup}
          wallGroups={moduleWallGroups}
          meshes={meshes}
          manager={materialManager}
          {...(onWallClick ? { onWallClick } : {})}
        />
      ))}
    </>
  );
});
