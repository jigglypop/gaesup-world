import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { CuboidCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { WallSystemProps } from './types';
import { MaterialManager } from '../../core/MaterialManager';
import { MeshConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';

export function WallSystem({ 
  wallGroup, 
  meshes, 
  isEditMode = false,
  onWallClick,
}: WallSystemProps) {
  const materialManagerRef = useRef<MaterialManager>(new MaterialManager());
  const instancedRef = useRef<THREE.InstancedMesh | null>(null);
  const width = TILE_CONSTANTS.WALL_SIZES.WIDTH;
  const height = TILE_CONSTANTS.WALL_SIZES.HEIGHT;
  const depth = TILE_CONSTANTS.WALL_SIZES.THICKNESS;

  const wallCount = wallGroup.walls.length;
  const [capacity, setCapacity] = useState(() => Math.max(1, wallCount));
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (wallCount <= capacity) return;
    // Grow with headroom to avoid recreating the InstancedMesh on every add.
    setCapacity(Math.max(wallCount, Math.ceil(capacity * 1.5)));
  }, [wallCount, capacity]);

  const geometry = useMemo(() => {
    const geom = new THREE.BoxGeometry(width, height, depth);
    geom.translate(0, 0, width / 2);
    return geom;
  }, [width, height, depth]);

  const materials = useMemo(() => {
    const manager = materialManagerRef.current;
    const defaultMesh: MeshConfig = { id: 'default', color: '#000000' };
    
    const frontMesh = wallGroup.frontMeshId ? meshes.get(wallGroup.frontMeshId) : defaultMesh;
    const backMesh = wallGroup.backMeshId ? meshes.get(wallGroup.backMeshId) : defaultMesh;
    const sideMesh = wallGroup.sideMeshId ? meshes.get(wallGroup.sideMeshId) : defaultMesh;

    return [
      manager.getMaterial(sideMesh || defaultMesh),
      manager.getMaterial(sideMesh || defaultMesh),
      manager.getMaterial(sideMesh || defaultMesh),
      manager.getMaterial(sideMesh || defaultMesh),
      manager.getMaterial(frontMesh || defaultMesh),
      manager.getMaterial(backMesh || defaultMesh),
    ];
  }, [wallGroup, meshes]);
  
  useLayoutEffect(() => {
    const mesh = instancedRef.current;
    if (!mesh) return;

    mesh.count = wallCount;
    for (let i = 0; i < wallCount; i++) {
      const wall = wallGroup.walls[i];
      if (!wall) continue;
      dummy.position.set(wall.position.x, wall.position.y + height / 2, wall.position.z);
      dummy.rotation.set(0, wall.rotation.y, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [wallGroup.walls, wallCount, dummy, height]);

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
      
      {isEditMode && wallGroup.walls.map((wall) => (
        <group
          key={wall.id}
          position={[wall.position.x, wall.position.y + height + 0.5, wall.position.z]}
          onClick={() => onWallClick?.(wall.id)}
        >
          <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
        </group>
      ))}
      
      <instancedMesh
        ref={instancedRef}
        args={[geometry, materials, capacity]}
        castShadow
        receiveShadow
      />
    </>
  );
} 