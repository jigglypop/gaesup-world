import { Suspense } from 'react';

import { TileObjectProps } from './types';
import Water from '../mesh/water';
import Grass from '../mesh/grass/Grass';
import { TILE_CONSTANTS } from '../../types/constants';

export function TileObject({ tile }: TileObjectProps) {
  if (!tile.objectType || tile.objectType === 'none' || tile.objectType === 'flag') return null;

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
      </Suspense>
    </group>
  );
} 