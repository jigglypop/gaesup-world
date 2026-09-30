import { memo, useEffect, useMemo } from 'react';

import { useThree } from '@react-three/fiber';

import FieldGrass from './FieldGrass';
import Grass, { createGrassGround, getGrassGroundMaterial } from './Grass';
import { MEADOW } from './ground';
import { groupGrassChunks, groupGrassGrounds, LEGACY_CHUNK_TILES, NODE_CHUNK_TILES, type GrassChunk, type GrassGround, type MeshLookup } from './layers';
import { getDefaultToonMode } from '../../../../rendering/toon';
import { rendererKind } from '../../../../rendering/webgpu';
import { useReusedByKey } from '../../../hooks/useReusedByKey';
import type { TileConfig } from '../../../types';

export type { GrassChunk, GrassGround } from './layers';

type Placed = { key: string; origin: readonly number[]; cells: readonly (readonly number[])[] };

function sameNumbers(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/** Same origin and cells: the rest of a chunk or ground follows from its key. */
function samePlacement(a: Placed, b: Placed): boolean {
  return sameNumbers(a.origin, b.origin)
    && a.cells.length === b.cells.length
    && a.cells.every((cell, index) => sameNumbers(cell, b.cells[index]!));
}

const GrassGroundMesh = memo(function GrassGroundMesh({ ground, node }: { ground: GrassGround; node: boolean }) {
  const geometry = useMemo(
    () => createGrassGround(ground.cells, ground.cellSize, ground.terrainColor, ground.terrainAccentColor, ground.origin[0], ground.origin[2]),
    [ground],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh position={ground.origin} geometry={geometry} material={getGrassGroundMaterial(getDefaultToonMode(), node)} receiveShadow />;
});

/**
 * Grass of a tile group: the painted meadow ground under tall-grass tiles and the blades. On node renderers (WebGPU and
 * its WebGL2 backend) blades are wind grass layers of 4 × 4 tiles with ragged borders, and tiles whose mesh sets `grass`
 * grow a lawn layer; the classic WebGL path keeps its 8 × 8 tall-grass chunks.
 */
export const GrassChunks = memo(function GrassChunks({ tiles, meshOf }: { tiles: readonly TileConfig[]; meshOf?: MeshLookup | undefined }) {
  const node = rendererKind(useThree((state) => state.gl)) !== 'webgl';
  const lookup = node ? meshOf : undefined;
  // An edit regroups every tile, but only the chunks it touched get new objects and rebuild their blades.
  const chunks = useReusedByKey(
    useMemo(() => groupGrassChunks(tiles, { meshOf: lookup, span: node ? NODE_CHUNK_TILES : LEGACY_CHUNK_TILES }), [tiles, lookup, node]),
    samePlacement,
  );
  const grounds = useReusedByKey(useMemo(() => groupGrassGrounds(tiles, lookup), [tiles, lookup]), samePlacement);
  return (
    <>
      {grounds.map((ground) => <GrassGroundMesh key={ground.key} ground={ground} node={node} />)}
      {chunks.map((chunk) => (node ? <FieldGrassChunk key={chunk.key} chunk={chunk} /> : (
        <Grass
          key={chunk.key}
          ground={false}
          position={chunk.origin}
          center={chunk.center}
          width={chunk.width}
          cells={chunk.cells}
          cellSize={chunk.cellSize}
          density={chunk.density}
          maxInstances={Math.ceil(chunk.density * chunk.cells.length * chunk.cellSize * chunk.cellSize)}
          {...(chunk.terrainColor ? { groundColor: chunk.terrainColor, bladeBottomColor: chunk.terrainColor } : {})}
          {...(chunk.terrainAccentColor ? { groundAccentColor: chunk.terrainAccentColor, bladeTipColor: chunk.terrainAccentColor } : {})}
        />
      )))}
    </>
  );
});

const FieldGrassChunk = memo(function FieldGrassChunk({ chunk }: { chunk: GrassChunk }) {
  const color = chunk.terrainColor ?? MEADOW.base;
  const accent = chunk.painted ? chunk.terrainAccentColor ?? MEADOW.accent : undefined;
  return (
    <group position={chunk.origin}>
      <FieldGrass
        profile={chunk.profile}
        cells={chunk.cells}
        cellSize={chunk.cellSize}
        origin={[chunk.origin[0], chunk.origin[2]]}
        density={chunk.density}
        height={chunk.height}
        color={color}
        accent={accent}
        lift={chunk.painted}
        toon={getDefaultToonMode()}
      />
    </group>
  );
});
