import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { TileGroupConfig, MeshConfig } from '../../types';
import { MaterialManager } from '../../core/MaterialManager';
import { GaeSupProps } from '../../../index';
import { TILE_CONSTANTS } from '../../types/constants';
import { TileObject } from '../TileObject';
import { MinimapEngine } from '../../../ui/core';

interface TileSystemProps {
  tileGroup: TileGroupConfig;
  meshes: Map<string, MeshConfig>;
  isEditMode?: boolean;
  onTileClick?: (tileId: string) => void;
  onTileDelete?: (tileId: string) => void;
}

export function TileSystem({ 
  tileGroup, 
  meshes, 
  isEditMode = false,
  onTileClick,
  onTileDelete 
}: TileSystemProps) {
  const materialManagerRef = useRef<MaterialManager>(new MaterialManager());

  const material = useMemo(() => {
    const manager = materialManagerRef.current;
    const floorMesh = meshes.get(tileGroup.floorMeshId);
    if (!floorMesh) {
      return new THREE.MeshStandardMaterial({ color: '#888888' });
    }
    return manager.getMaterial(floorMesh);
  }, [tileGroup.floorMeshId, meshes]);

  const mergedGeometry = useMemo(() => {
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    let indexOffset = 0;

    tileGroup.tiles.forEach((tile) => {
      const tileMultiplier = tile.size || 1;
      const tileSize = TILE_CONSTANTS.GRID_CELL_SIZE * tileMultiplier;
      const geometry = new THREE.PlaneGeometry(tileSize, tileSize);
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(tile.position.x, tile.position.y + 0.001, tile.position.z);

      const vertexPositions = Array.from(
        geometry.attributes.position.array as Float32Array
      );
      positions.push(...vertexPositions);

      const vertexIndices = geometry.index
        ? Array.from(geometry.index.array as Uint16Array)
        : [];
      indices.push(...vertexIndices.map((idx) => idx + indexOffset));

      const tileUvs = [0, 0, 1, 0, 1, 1, 0, 1];
      uvs.push(...tileUvs);

      indexOffset += geometry.attributes.position.count;
      geometry.dispose();
    });

    const merged = new THREE.BufferGeometry();
    merged.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    merged.setIndex(indices);
    merged.computeVertexNormals();
    return merged;
  }, [tileGroup.tiles]);

  useEffect(() => {
    if (tileGroup.tiles.length > 0) {
      const engine = MinimapEngine.getInstance();
      const bounds = new THREE.Box3();
      
      tileGroup.tiles.forEach((tile) => {
        const tileSize = (tile.size || 1) * TILE_CONSTANTS.GRID_CELL_SIZE;
        const halfSize = tileSize / 2;
        
        bounds.expandByPoint(new THREE.Vector3(
          tile.position.x - halfSize,
          tile.position.y,
          tile.position.z - halfSize
        ));
        bounds.expandByPoint(new THREE.Vector3(
          tile.position.x + halfSize,
          tile.position.y,
          tile.position.z + halfSize
        ));
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
    }
  }, [tileGroup]);

  useEffect(() => {
    return () => {
      materialManagerRef.current.dispose();
      mergedGeometry.dispose();
      material.dispose();
    };
  }, [mergedGeometry, material]);

  if (!mergedGeometry || !material) return null;

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
              <mesh>
                <boxGeometry args={[0.8, 0.3, 0.8]} />
                <meshStandardMaterial 
                  color="#ff0000" 
                  transparent 
                  opacity={0.6}
                  emissive="#ff0000"
                  emissiveIntensity={0.2}
                />
              </mesh>
            </group>
          );
        })}
        
        <mesh
          castShadow
          receiveShadow
          geometry={mergedGeometry}
          material={material}
        />
        
        {tileGroup.tiles.map((tile) => (
          <TileObject key={`${tile.id}-object`} tile={tile} />
        ))}
      </>
    </GaeSupProps>
  );
} 