import { Suspense, useEffect, useMemo } from 'react';

import * as THREE from 'three';

import { TileObjectProps } from './types';
import Water from '../mesh/water';
import Grass from '../mesh/grass/Grass';
import { FlagMesh } from '../mesh/flag';
import { TILE_CONSTANTS } from '../../types/constants';

function FlagObject({ textureUrl }: { textureUrl: string | null }) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(1.5, 1), []);
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[0.05, 4, 0.05]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <FlagMesh
        geometry={geometry}
        pamplet_url={textureUrl}
        position={[0.75, 3, 0]}
      />
    </group>
  );
}

export function TileObject({ tile }: TileObjectProps) {
  if (!tile.objectType || tile.objectType === 'none') return null;

  const tileSize = TILE_CONSTANTS.GRID_CELL_SIZE * (tile.size || 1);
  const position = [tile.position.x, tile.position.y, tile.position.z] as [number, number, number];

  return (
    <group position={position}>
      <Suspense fallback={null}>
        {tile.objectType === 'water' && (
          <group scale={[tileSize / 16, 1, tileSize / 16]}>
            <Water />
          </group>
        )}

        {tile.objectType === 'grass' && (
          <Grass
            width={tileSize}
            instances={tile.objectConfig?.grassDensity || 1000}
            position={[0, 0.05, 0]}
          />
        )}

        {tile.objectType === 'flag' && (
          <FlagObject
            textureUrl={tile.objectConfig?.flagTexture ?? null}
          />
        )}
      </Suspense>
    </group>
  );
} 