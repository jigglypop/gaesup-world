import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import * as THREE from 'three';

import { TileSystemProps } from './types';
import { GaeSupProps } from '../../../index';
import { MinimapSystem } from '../../../ui/core';
import { MaterialManager } from '../../core/MaterialManager';
import { TILE_CONSTANTS } from '../../types/constants';
import { TileObject } from '../TileObject';

export function TileSystem({ 
  tileGroup, 
  meshes, 
  isEditMode = false,
  onTileClick,
}: TileSystemProps) {
  const materialManagerRef = useRef<MaterialManager>(new MaterialManager());
  const instancedRef = useRef<THREE.InstancedMesh | null>(null);
  const localMaterialRef = useRef<THREE.Material | null>(null);

  const tileCount = tileGroup.tiles.length;
  const [capacity, setCapacity] = useState(() => Math.max(1, tileCount));

  const material = useMemo(() => {
    const manager = materialManagerRef.current;
    const floorMesh = meshes.get(tileGroup.floorMeshId);
    if (!floorMesh) {
      // Dispose the previous local material (if any) before creating a new one.
      localMaterialRef.current?.dispose();
      const m = new THREE.MeshStandardMaterial({ color: '#888888' });
      localMaterialRef.current = m;
      return m;
    }
    // If we switch from local -> managed material, ensure we don't leak the local one.
    localMaterialRef.current?.dispose();
    localMaterialRef.current = null;
    return manager.getMaterial(floorMesh);
  }, [tileGroup.floorMeshId, meshes]);

  const baseGeometry = useMemo(() => {
    // A single unit plane; per-tile size/position is applied via instancing.
    const geom = new THREE.PlaneGeometry(1, 1, 1, 1);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const editGeometry = useMemo(() => new THREE.BoxGeometry(0.8, 0.3, 0.8), []);
  const editMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ff0000',
        transparent: true,
        opacity: 0.6,
        emissive: new THREE.Color('#ff0000'),
        emissiveIntensity: 0.2,
      }),
    [],
  );

  const tilesWithObjects = useMemo(
    () => tileGroup.tiles.filter((t) => t.objectType && t.objectType !== 'none'),
    [tileGroup.tiles],
  );

  useEffect(() => {
    if (tileCount <= capacity) return;
    // Grow with headroom to avoid recreating the InstancedMesh on every add.
    setCapacity(Math.max(tileCount, Math.ceil(capacity * 1.5)));
  }, [tileCount, capacity]);

  useLayoutEffect(() => {
    const mesh = instancedRef.current;
    if (!mesh) return;

    const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;
    mesh.count = tileCount;

    for (let i = 0; i < tileCount; i++) {
      const tile = tileGroup.tiles[i];
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

    // Compute a tight bounding box/sphere so frustum culling works correctly.
    if (tileCount > 0) {
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    }
  }, [tileGroup.tiles, tileCount, dummy]);

  useEffect(() => {
    if (tileGroup.tiles.length === 0) return undefined;
    const engine = MinimapSystem.getInstance();
    const bounds = new THREE.Box3();
    const tmp = new THREE.Vector3();
    
    tileGroup.tiles.forEach((tile) => {
      const tileSize = (tile.size || 1) * TILE_CONSTANTS.GRID_CELL_SIZE;
      const halfSize = tileSize / 2;
      
      tmp.set(tile.position.x - halfSize, tile.position.y, tile.position.z - halfSize);
      bounds.expandByPoint(tmp);
      tmp.set(tile.position.x + halfSize, tile.position.y, tile.position.z + halfSize);
      bounds.expandByPoint(tmp);
    });
    
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    bounds.getCenter(center);
    bounds.getSize(size);
    
    engine.addMarker(
      `tile-group-${tileGroup.id}`,
      'ground',
      tileGroup.name || 'Tiles',
      center,
      size
    );
    
    return () => {
      engine.removeMarker(`tile-group-${tileGroup.id}`);
    };
  }, [tileGroup]);

  useEffect(() => {
    return () => {
      materialManagerRef.current.dispose();
      localMaterialRef.current?.dispose();
      localMaterialRef.current = null;
      baseGeometry.dispose();
      editGeometry.dispose();
      editMaterial.dispose();
    };
  }, [baseGeometry, editGeometry, editMaterial]);

  return (
    <GaeSupProps type="ground">
      <>
        {isEditMode && tileGroup.tiles.map((tile) => {
          return (
            <group
              key={tile.id}
              position={[tile.position.x, tile.position.y + 0.3, tile.position.z]}
              onClick={() => onTileClick?.(tile.id)}
            >
              <mesh geometry={editGeometry} material={editMaterial} />
            </group>
          );
        })}
        
        <instancedMesh
          ref={instancedRef}
          args={[baseGeometry, material, capacity]}
          castShadow
          receiveShadow
          frustumCulled
        />
        
        {tilesWithObjects.map((tile) => (
          <TileObject key={`${tile.id}-object`} tile={tile} />
        ))}
      </>
    </GaeSupProps>
  );
} 