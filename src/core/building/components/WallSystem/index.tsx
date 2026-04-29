import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { CuboidCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { WallSystemProps } from './types';
import { MaterialManager } from '../../core/MaterialManager';
import { MeshConfig, WallConfig, WallGroupConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';

type WallBatch = {
  key: string;
  walls: WallConfig[];
  materials: THREE.Material[];
};

const DEFAULT_WALL_MESH: MeshConfig = { id: 'default', color: '#000000' };

export function getWallMaterialKey(wall: WallConfig): string {
  return wall.materialId ? `material:${wall.materialId}` : `type:${wall.wallGroupId}`;
}

function getWallMaterials(
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

  return [
    manager.getMaterial(sideMesh ?? DEFAULT_WALL_MESH),
    manager.getMaterial(sideMesh ?? DEFAULT_WALL_MESH),
    manager.getMaterial(sideMesh ?? DEFAULT_WALL_MESH),
    manager.getMaterial(sideMesh ?? DEFAULT_WALL_MESH),
    manager.getMaterial(frontMesh ?? DEFAULT_WALL_MESH),
    manager.getMaterial(backMesh ?? DEFAULT_WALL_MESH),
  ];
}

function buildWallBatches(
  wallGroup: WallGroupConfig,
  wallGroups: Map<string, WallGroupConfig>,
  meshes: Map<string, MeshConfig>,
  manager: MaterialManager,
): WallBatch[] {
  const grouped = new Map<string, WallConfig[]>();
  for (const wall of wallGroup.walls) {
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

function WallBatchMesh({
  batch,
  geometry,
  height,
  onWallClick,
}: {
  batch: WallBatch;
  geometry: THREE.BoxGeometry;
  height: number;
  onWallClick?: (wallId: string) => void;
}) {
  const instancedRef = useRef<THREE.InstancedMesh | null>(null);
  const wallCount = batch.walls.length;
  const [capacity, setCapacity] = useState(() => Math.max(1, wallCount));
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (wallCount <= capacity) return;
    setCapacity(Math.max(wallCount, Math.ceil(capacity * 1.5)));
  }, [wallCount, capacity]);

  useLayoutEffect(() => {
    const mesh = instancedRef.current;
    if (!mesh) return;

    mesh.count = wallCount;
    for (let i = 0; i < wallCount; i++) {
      const wall = batch.walls[i];
      if (!wall) continue;
      dummy.position.set(wall.position.x, wall.position.y + height / 2, wall.position.z);
      dummy.rotation.set(0, wall.rotation.y, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (wallCount > 0) {
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    }
  }, [batch.walls, wallCount, dummy, height, capacity]);

  const handleClick = (event: { stopPropagation: () => void; instanceId?: number }) => {
    event.stopPropagation();
    const wall = event.instanceId !== undefined ? batch.walls[event.instanceId] : undefined;
    if (wall) onWallClick?.(wall.id);
  };

  return (
    <instancedMesh
      ref={instancedRef}
      args={[geometry, batch.materials, capacity]}
      castShadow
      receiveShadow
      {...(onWallClick ? { onClick: handleClick } : {})}
    />
  );
}

export function WallSystem({ 
  wallGroup, 
  wallGroups,
  meshes, 
  isEditMode = false,
  selectedWallId = null,
  onWallClick,
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

  useEffect(() => {
    return () => {
      materialManagerRef.current.dispose();
      geometry.dispose();
    };
  }, [geometry]);

  const colliderData = useMemo(() => {
    if (isEditMode) return [];
    const halfW = width / 2;
    return wallGroup.walls.map((wall) => {
      const sinY = Math.sin(wall.rotation.y);
      const cosY = Math.cos(wall.rotation.y);
      return {
        id: wall.id,
        position: [
          wall.position.x + sinY * halfW,
          wall.position.y + height / 2,
          wall.position.z + cosY * halfW,
        ] as [number, number, number],
        rotation: [0, wall.rotation.y, 0] as [number, number, number],
      };
    });
  }, [wallGroup.walls, width, height, isEditMode]);

  return (
    <>
      {!isEditMode && colliderData.length > 0 && (
        <RigidBody type="fixed" colliders={false}>
          {colliderData.map((c) => (
            <CuboidCollider
              key={c.id}
              position={c.position}
              rotation={c.rotation}
              args={[width / 2, height / 2, depth / 2]}
            />
          ))}
        </RigidBody>
      )}
      
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
      
      {batches.map((batch) => (
        <WallBatchMesh
          key={`${wallGroup.id}-${batch.key}`}
          batch={batch}
          geometry={geometry}
          height={height}
          {...(onWallClick ? { onWallClick } : {})}
        />
      ))}
    </>
  );
} 