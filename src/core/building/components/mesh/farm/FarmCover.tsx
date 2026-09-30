import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import type * as THREE from 'three';

import type { PlantKind } from './crops';
import { FarmPlants } from './FarmPlants';
import { farmGroundMaterials } from './materials';
import { castNearShadowOnly } from '../../../../rendering/sky/nearShadow';
import { getDefaultToonMode } from '../../../../rendering/toon';
import { rendererKind } from '../../../../rendering/webgpu';
import { useReusedByKey } from '../../../hooks/useReusedByKey';
import { SOILS } from '../../../terrain/farm/config';
import { farmChunks, farmSquares, type FarmChunk, type FarmSquare } from '../../../terrain/farm/layout';
import { buildFarmBoards, buildFarmSoil } from '../../../terrain/farm/soil';
import type { FarmStage, TileConfig } from '../../../types';

/** Chunk side (m): soil and plants rebuild, cull and pick their LOD a chunk at a time. */
export const FARM_CHUNK = 16;

const disableRaycast = () => undefined;
const NON_INTERACTIVE = { nonInteractive: true };

const sameSquare = (a: FarmSquare, b: FarmSquare) =>
  a.x === b.x && a.y === b.y && a.z === b.z && a.size === b.size && a.key === b.key && a.mask === b.mask;
/** Plants batch by crop and stage within a chunk, whatever bed they grow in; fallow beds add their weeds. */
const byCrop = ({ plot }: FarmSquare) => (plot.crop === 'none' ? null : `${plot.crop}|${plot.stage}`);
const byWeeds = ({ plot }: FarmSquare) => (SOILS[plot.soil].weeds > 0 ? 'weed|ripe' : null);
const plantOf = (chunk: FarmChunk) => chunk.key.split('|').slice(1) as [PlantKind, FarmStage];

/** Same squares in the same order: an edit elsewhere leaves the chunk's meshes alone. */
const sameChunk = (a: FarmChunk, b: FarmChunk) => a.squares.length === b.squares.length && a.squares.every((square, i) => sameSquare(square, b.squares[i]!));

/** A chunk's soil, paddy water and wooden edging: up to three draws. */
const FarmGround = memo(function FarmGround({ chunk, toon }: { chunk: FarmChunk; toon: boolean }) {
  const node = rendererKind(useThree((state) => state.gl)) !== 'webgl';
  const { surface, water } = useMemo(() => buildFarmSoil(chunk.squares), [chunk]);
  const boards = useMemo(() => buildFarmBoards(chunk.squares), [chunk]);
  useEffect(() => () => {
    surface?.dispose();
    water?.dispose();
  }, [surface, water]);
  useEffect(() => () => boards?.dispose(), [boards]);
  const edging = useRef<THREE.Mesh>(null);
  useLayoutEffect(() => (boards && edging.current ? castNearShadowOnly(edging.current) : undefined), [boards]);
  const materials = farmGroundMaterials(node, toon);
  return (
    <>
      {surface && <mesh name="farm-soil" geometry={surface} material={materials.soil} receiveShadow />}
      {water && <mesh name="farm-water" geometry={water} material={materials.water} raycast={disableRaycast} userData={NON_INTERACTIVE} />}
      {boards && <mesh ref={edging} name="farm-boards" geometry={boards} material={materials.boards} castShadow receiveShadow />}
    </>
  );
});

/**
 * Every farm tile of a tile group: tilled soil in furrows with banks or wooden edging at the beds' open borders,
 * paddy water, and the crops as instanced plants by crop, stage and chunk. Tiles of one plot join into a bed whose
 * rows run on across them. A tile edit rebuilds only the chunks it changed.
 */
export const FarmCover = memo(function FarmCover({ tiles, toon }: { tiles: readonly TileConfig[]; toon?: boolean }) {
  const useToon = toon ?? getDefaultToonMode();
  const squares = useMemo(() => farmSquares(tiles), [tiles]);
  const grounds = useReusedByKey(useMemo(() => farmChunks(squares, FARM_CHUNK), [squares]), sameChunk);
  const plants = useReusedByKey(
    useMemo(() => [...farmChunks(squares, FARM_CHUNK, byCrop), ...farmChunks(squares, FARM_CHUNK, byWeeds)], [squares]),
    sameChunk,
  );
  return (
    <>
      {grounds.map((chunk) => <FarmGround key={chunk.key} chunk={chunk} toon={useToon} />)}
      {plants.map((chunk) => {
        const [kind, stage] = plantOf(chunk);
        return <FarmPlants key={chunk.key} chunk={chunk} kind={kind} stage={stage} toon={useToon} />;
      })}
    </>
  );
});
