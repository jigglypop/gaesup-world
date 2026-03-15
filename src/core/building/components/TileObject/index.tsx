import { Suspense, useMemo } from 'react';

import { TileObjectProps } from './types';
import Water from '../mesh/water';
import Grass from '../mesh/grass/Grass';
import Fire from '../mesh/fire';
import Billboard from '../mesh/billboard';
import Sand from '../mesh/sand';
import Snowfield from '../mesh/snowfield';
import type { TileConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';

type WaterShoreMask = {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
};

function tileCoversPoint(tile: TileConfig, x: number, z: number): boolean {
  const tileSize = TILE_CONSTANTS.GRID_CELL_SIZE * (tile.size || 1);
  const half = tileSize / 2;

  return (
    x > tile.position.x - half + 0.001 &&
    x < tile.position.x + half - 0.001 &&
    z > tile.position.z - half + 0.001 &&
    z < tile.position.z + half - 0.001
  );
}

function getWaterShoreMask(tile: TileConfig, tiles?: TileConfig[]): WaterShoreMask {
  const tileSize = TILE_CONSTANTS.GRID_CELL_SIZE * (tile.size || 1);
  const half = tileSize / 2;
  const sampleOffset = Math.max(0.08, tileSize * 0.06);
  const levelThreshold = Math.max(0.12, TILE_CONSTANTS.HEIGHT_STEP * 0.25);

  const hasConnectedWater = (x: number, z: number) =>
    (tiles ?? []).some(
      (candidate) =>
        candidate.id !== tile.id &&
        candidate.objectType === 'water' &&
        Math.abs(candidate.position.y - tile.position.y) <= levelThreshold &&
        tileCoversPoint(candidate, x, z),
    );

  return {
    north: !hasConnectedWater(tile.position.x, tile.position.z - half - sampleOffset),
    south: !hasConnectedWater(tile.position.x, tile.position.z + half + sampleOffset),
    west: !hasConnectedWater(tile.position.x - half - sampleOffset, tile.position.z),
    east: !hasConnectedWater(tile.position.x + half + sampleOffset, tile.position.z),
  };
}

export function TileObject({ tile, tiles }: TileObjectProps) {
  if (!tile.objectType || tile.objectType === 'none' || tile.objectType === 'flag') return null;

  const tileShape = tile.shape ?? 'box';
  const isTerrainCover = tile.objectType === 'sand' || tile.objectType === 'snowfield';
  if (isTerrainCover && tileShape !== 'box') return null;

  const tileSize = TILE_CONSTANTS.GRID_CELL_SIZE * (tile.size || 1);
  const position = [tile.position.x, tile.position.y, tile.position.z] as [number, number, number];
  const waterShoreMask = useMemo(() => getWaterShoreMask(tile, tiles), [tile, tiles]);

  return (
    <group position={position}>
      <Suspense fallback={null}>
        {tile.objectType === 'water' && (
          <Water size={tileSize} shore={waterShoreMask} center={position} />
        )}

        {tile.objectType === 'grass' && (
          <Grass
            width={tileSize}
            instances={tile.objectConfig?.grassDensity || 1000}
            position={[0, 0.05, 0]}
          />
        )}

        {tile.objectType === 'fire' && (
          <Fire intensity={tile.objectConfig?.fireIntensity ?? 1.5} />
        )}

        {tile.objectType === 'sand' && (
          <Sand size={tileSize} />
        )}

        {tile.objectType === 'snowfield' && (
          <Snowfield size={tileSize} />
        )}

        {tile.objectType === 'billboard' && (
          <Billboard
            {...(tile.objectConfig?.billboardText ? { text: tile.objectConfig.billboardText } : {})}
            {...(tile.objectConfig?.billboardImageUrl ? { imageUrl: tile.objectConfig.billboardImageUrl } : {})}
            {...(tile.objectConfig?.billboardColor ? { color: tile.objectConfig.billboardColor } : {})}
          />
        )}
      </Suspense>
    </group>
  );
} 