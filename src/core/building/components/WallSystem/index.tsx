import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CuboidCollider } from '@react-three/rapier';
import { WallGroupConfig, MeshConfig } from '../../types';
import { MaterialManager } from '../../core/MaterialManager';
import { TILE_CONSTANTS } from '../../types/constants';

interface WallSystemProps {
  wallGroup: WallGroupConfig;
  meshes: Map<string, MeshConfig>;
  isEditMode?: boolean;
  onWallClick?: (wallId: string) => void;
  onWallDelete?: (wallId: string) => void;
}

export function WallSystem({ 
  wallGroup, 
  meshes, 
  isEditMode = false,
  onWallClick,
  onWallDelete 
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

  const instancedMesh = useMemo(() => {
    const count = wallGroup.walls.length;
    const mesh = new THREE.InstancedMesh(geometry, materials, count);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    const dummy = new THREE.Object3D();
    wallGroup.walls.forEach((wall, i) => {
      dummy.position.set(
        wall.position.x,
        wall.position.y + height / 2,
        wall.position.z
      );
      dummy.rotation.set(0, wall.rotation.y, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }, [wallGroup.walls, geometry, materials, height]);

  useEffect(() => {
    return () => {
      materialManagerRef.current.dispose();
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <>
      {!isEditMode && wallGroup.walls.map((wall, index) => {
        const rotationMatrix = new THREE.Matrix4().makeRotationY(wall.rotation.y);
        const centerPoint = new THREE.Vector3(0, 0, width / 2);
        centerPoint.applyMatrix4(rotationMatrix);
        
        return (
          <CuboidCollider
            key={wall.id}
            position={[
              wall.position.x + centerPoint.x,
              wall.position.y + height / 2,
              wall.position.z + centerPoint.z,
            ]}
            rotation={[0, wall.rotation.y, 0]}
            args={[width / 2, height / 2, depth / 2]}
          />
        );
      })}
      
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
      
      <primitive object={instancedMesh} />
    </>
  );
} 