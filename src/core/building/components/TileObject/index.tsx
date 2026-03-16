import { Suspense, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { weightFromDistance } from '@core/utils/sfe';

import { TileObjectProps } from './types';
import Water from '../mesh/water';
import Grass from '../mesh/grass/Grass';
import type { TileConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';

const SFE_NEAR = 25;
const SFE_FAR = 90;
const SFE_STRENGTH = 4;

type WaterShoreMask = {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
};

const DEFAULT_WATER_SHORE_MASK: WaterShoreMask = {
  north: true,
  south: true,
  east: true,
  west: true,
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

const BATCHED_COVERS = new Set(['sand', 'snowfield']);

export function TileObject({ tile, tiles }: TileObjectProps) {
  if (!tile.objectType || tile.objectType === 'none') return null;
  if (BATCHED_COVERS.has(tile.objectType)) return null;

  const groupRef = useRef<THREE.Group>(null!);
  const visibleRef = useRef(true);
  const lodAccumRef = useRef(0);

  const tileSize = TILE_CONSTANTS.GRID_CELL_SIZE * (tile.size || 1);
  const position = [tile.position.x, tile.position.y, tile.position.z] as [number, number, number];
  const waterShoreMask = useMemo(
    () => (tile.objectType === 'water' ? getWaterShoreMask(tile, tiles) : DEFAULT_WATER_SHORE_MASK),
    [tile, tiles],
  );

  useFrame((state, delta) => {
    lodAccumRef.current += delta;
    const interval = visibleRef.current ? 0.3 : 0.8;
    if (lodAccumRef.current < interval) return;
    lodAccumRef.current = 0;

    const cam = state.camera.position;
    const p = tile.position;
    const dx = cam.x - p.x, dy = cam.y - p.y, dz = cam.z - p.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const w = weightFromDistance(dist, SFE_NEAR, SFE_FAR, SFE_STRENGTH);
    const vis = w > 0;
    if (vis !== visibleRef.current) {
      visibleRef.current = vis;
      if (groupRef.current) groupRef.current.visible = vis;
    }
  });

  return (
    <group ref={groupRef} position={position}>
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
      </Suspense>
    </group>
  );
}
