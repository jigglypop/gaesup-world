import { useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { getWallKind, getWallMaterialKey, getWallMaterials, WallBatchMesh, type WallBatch } from './batch';
import { createWallColliders } from './colliders';
import { WallSystemProps } from './types';
import { MaterialManager } from '../../core/MaterialManager';
import { MeshConfig, WallConfig, WallGroupConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import { BuildingColliderBody } from '../BuildingColliders';
import type { BuildingColliderBox } from '../BuildingColliders/types';

export { getWallMaterialKey };

const EMPTY_COLLIDER_BOXES: readonly BuildingColliderBox[] = [];
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
  return getWallKind(wall, group) === 'solid';
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
  width,
  height,
  depth,
  onWallClick,
}: {
  wall: WallConfig;
  wallGroup: WallGroupConfig;
  wallGroups: Map<string, WallGroupConfig>;
  meshes: Map<string, MeshConfig>;
  manager: MaterialManager;
  width: number;
  height: number;
  depth: number;
  onWallClick?: (wallId: string) => void;
}) {
  const kind = getWallKind(wall, wallGroup);
  const materials = getWallMaterials(manager, meshes, wall, wallGroups, wallGroup);
  const glass = getGlassMaterial(manager);
  const door = getDoorMaterial(manager, meshes, wallGroup);
  const z = width / 2;
  const railHeight = height * 0.46;
  const handleClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onWallClick?.(wall.id);
  };

  const pieces = (() => {
    if (kind === 'half') {
      return [
        <WallPiece key="half" position={[0, railHeight / 2, z]} size={[width, railHeight, depth]} materials={materials} />,
      ];
    }
    if (kind === 'railing') {
      const postH = height * 0.62;
      return [
        <WallPiece key="post-l" position={[-width * 0.42, postH / 2, z]} size={[0.18, postH, depth]} materials={materials} />,
        <WallPiece key="post-c" position={[0, postH / 2, z]} size={[0.16, postH * 0.9, depth]} materials={materials} />,
        <WallPiece key="post-r" position={[width * 0.42, postH / 2, z]} size={[0.18, postH, depth]} materials={materials} />,
        <WallPiece key="rail-top" position={[0, postH * 0.82, z]} size={[width, 0.18, depth]} materials={materials} />,
        <WallPiece key="rail-mid" position={[0, postH * 0.48, z]} size={[width * 0.88, 0.12, depth]} materials={materials} />,
      ];
    }
    if (kind === 'door' || kind === 'arch') {
      const sideW = width * 0.24;
      const openingW = width - sideW * 2;
      const headerH = kind === 'arch' ? height * 0.34 : height * 0.22;
      const doorH = height - headerH;
      return [
        <WallPiece key="left" position={[-(openingW + sideW) / 2, height / 2, z]} size={[sideW, height, depth]} materials={materials} />,
        <WallPiece key="right" position={[(openingW + sideW) / 2, height / 2, z]} size={[sideW, height, depth]} materials={materials} />,
        <WallPiece key="top" position={[0, height - headerH / 2, z]} size={[openingW, headerH, depth]} materials={materials} />,
        <WallPiece key="door" position={[0, doorH / 2, z - depth * 0.07]} size={[openingW * 0.76, doorH * 0.94, depth * 0.34]} materials={door} />,
      ];
    }
    if (kind === 'window') {
      const sideW = width * 0.22;
      const bandH = height * 0.24;
      const openingW = width - sideW * 2;
      const openingH = height - bandH * 2;
      return [
        <WallPiece key="left" position={[-(openingW + sideW) / 2, height / 2, z]} size={[sideW, height, depth]} materials={materials} />,
        <WallPiece key="right" position={[(openingW + sideW) / 2, height / 2, z]} size={[sideW, height, depth]} materials={materials} />,
        <WallPiece key="bottom" position={[0, bandH / 2, z]} size={[openingW, bandH, depth]} materials={materials} />,
        <WallPiece key="top" position={[0, height - bandH / 2, z]} size={[openingW, bandH, depth]} materials={materials} />,
        <WallPiece key="glass" position={[0, height / 2, z - depth * 0.08]} size={[openingW * 0.82, openingH * 0.72, depth * 0.24]} materials={glass} />,
      ];
    }
    return [
      <WallPiece key="glass-wall" position={[0, height / 2, z]} size={[width, height, depth * 0.4]} materials={glass} />,
      <WallPiece key="frame-top" position={[0, height - 0.08, z]} size={[width, 0.16, depth]} materials={materials} />,
      <WallPiece key="frame-bottom" position={[0, 0.08, z]} size={[width, 0.16, depth]} materials={materials} />,
      <WallPiece key="frame-left" position={[-width / 2 + 0.08, height / 2, z]} size={[0.16, height, depth]} materials={materials} />,
      <WallPiece key="frame-right" position={[width / 2 - 0.08, height / 2, z]} size={[0.16, height, depth]} materials={materials} />,
    ];
  })();

  return (
    <group
      position={[wall.position.x, wall.position.y, wall.position.z]}
      rotation={[0, wall.rotation.y, 0]}
      {...(onWallClick ? { onClick: handleClick } : {})}
    >
      {pieces}
    </group>
  );
}

export function WallSystem({
  wallGroup,
  wallGroups,
  meshes,
  isEditMode = false,
  selectedWallId = null,
  onWallClick,
  colliders = true,
  batches: renderBatches = true,
}: WallSystemProps) {
  const materialManagerRef = useRef<MaterialManager>(new MaterialManager());
  const width = TILE_CONSTANTS.WALL_SIZES.WIDTH;
  const height = TILE_CONSTANTS.WALL_SIZES.HEIGHT;
  const depth = TILE_CONSTANTS.WALL_SIZES.THICKNESS;

  const geometry = useMemo(() => {
    const geom = new THREE.BoxGeometry(width, height, depth);
    geom.translate(0, 0, width / 2);
    return geom;
  }, [width, height, depth]);

  const batches = useMemo(
    () => buildWallBatches(wallGroup, wallGroups ?? new Map([[wallGroup.id, wallGroup]]), meshes, materialManagerRef.current),
    [wallGroup, wallGroups, meshes],
  );
  const moduleWallGroups = wallGroups ?? new Map([[wallGroup.id, wallGroup]]);
  const moduleWalls = useMemo(
    () => wallGroup.walls.filter((wall) => !isBatchedWall(wall, wallGroup)),
    [wallGroup],
  );

  useEffect(() => {
    return () => {
      materialManagerRef.current.dispose();
      geometry.dispose();
    };
  }, [geometry]);

  const colliderBoxes = useMemo(
    () => (colliders && !isEditMode ? createWallColliders(wallGroup.walls) : EMPTY_COLLIDER_BOXES),
    [colliders, isEditMode, wallGroup.walls],
  );

  return (
    <>
      <BuildingColliderBody boxes={colliderBoxes} />

      {isEditMode && wallGroup.walls.map((wall) => {
        const selected = wall.id === selectedWallId;
        return (
          <group
            key={wall.id}
            position={[wall.position.x, wall.position.y + height + 0.5, wall.position.z]}
            onClick={() => onWallClick?.(wall.id)}
          >
            <mesh scale={selected ? 1.28 : 1}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial
                color={selected ? '#bae6fd' : '#7dd3fc'}
                emissive={selected ? '#60a5fa' : '#2f8dbd'}
                emissiveIntensity={selected ? 0.5 : 0.22}
                transparent
                opacity={selected ? 0.94 : 0.78}
              />
            </mesh>
          </group>
        );
      })}

      {renderBatches && batches.map((batch) => (
        <WallBatchMesh
          key={`${wallGroup.id}-${batch.key}`}
          batch={batch}
          geometry={geometry}
          height={height}
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
          manager={materialManagerRef.current}
          width={width}
          height={height}
          depth={depth}
          {...(onWallClick ? { onWallClick } : {})}
        />
      ))}
    </>
  );
}
