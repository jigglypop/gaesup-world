import * as THREE from 'three';

import { getStairLayout, rotateXZ } from './layout';
import type { TileSystemProps } from './types';
import { createCellIndex, type CellQuery } from '../../model/cellIndex';
import { cellSpan, tileWorldSize } from '../../model/footprint';
import { TILE_CONSTANTS } from '../../types/constants';

type TileLike = TileSystemProps['tileGroup']['tiles'][number];

export type TerrainRock = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

type TerrainBuild = {
  sideGeometry: THREE.BufferGeometry;
  rocks: TerrainRock[];
  /** Only cliffs cast shadows; the few-centimeter lip of a ground cover does not. */
  castShadow: boolean;
};

const SHADOW_CASTING_DROP = TILE_CONSTANTS.HEIGHT_STEP * 0.5;

type TileBounds = {
  id: string;
  topY: number;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerZ: number;
  segments: number;
};

const TERRAIN_COVER_EDGE_LIFT: Partial<Record<NonNullable<TileLike['objectType']>, number>> = {
  grass: 0.05,
  sand: 0.065,
  snowfield: 0.055,
  water: 0.055,
};

function fract(value: number): number {
  return value - Math.floor(value);
}

// Weight of the n-th argument, n * 19.19 + 7.13, computed as before so every hash keeps its value.
const [W0, W1, W2, W3] = [0 * 19.19 + 7.13, 1 * 19.19 + 7.13, 2 * 19.19 + 7.13, 3 * 19.19 + 7.13] as const;

/** Fixed arity instead of rest arguments: a terrain build calls it a few times per side. Missing arguments add 0. */
function hashNoise(a: number, b = 0, c = 0, d = 0): number {
  const seed = 0 + a * W0 + b * W1 + c * W2 + d * W3;
  return fract(Math.sin(seed) * 43758.5453123);
}

function buildTileBounds(tile: TileLike): TileBounds {
  const tileSize = tileWorldSize(tile);
  const half = tileSize / 2;
  const terrainLift = tile.objectType ? (TERRAIN_COVER_EDGE_LIFT[tile.objectType] ?? 0) : 0;

  return {
    id: tile.id,
    topY: tile.position.y + terrainLift,
    minX: tile.position.x - half,
    maxX: tile.position.x + half,
    minZ: tile.position.z - half,
    maxZ: tile.position.z + half,
    centerX: tile.position.x,
    centerZ: tile.position.z,
    segments: cellSpan(tile.size),
  };
}

/** Tiles near a point, bucketed once per tile set; building one side or stair asks it instead of scanning all tiles. */
export type TileSupport = CellQuery<TileBounds>;

export function createTileSupport(tiles: readonly TileLike[]): TileSupport {
  return createCellIndex(tiles.map(buildTileBounds), (bounds) => bounds);
}

function sampleSupportHeight(near: TileSupport, currentId: string, x: number, z: number): number {
  let support = 0;

  for (const bounds of near(x, z)) {
    if (bounds.id === currentId) continue;
    if (
      x > bounds.minX + 0.001 &&
      x < bounds.maxX - 0.001 &&
      z > bounds.minZ + 0.001 &&
      z < bounds.maxZ - 0.001
    ) {
      support = Math.max(support, bounds.topY);
    }
  }

  return support;
}

const corner = new THREE.Vector3();

/** The vertical quad from (x0, z0) to (x1, z1) between `topY` and `bottomY`, as two triangles. */
function pushSideQuad(
  positions: number[],
  colors: number[],
  x0: number,
  z0: number,
  x1: number,
  z1: number,
  topY: number,
  bottomY: number,
  top: THREE.Color,
  bottom: THREE.Color,
) {
  positions.push(x0, topY, z0, x1, topY, z1, x1, bottomY, z1, x0, topY, z0, x1, bottomY, z1, x0, bottomY, z0);
  colors.push(top.r, top.g, top.b, top.r, top.g, top.b, bottom.r, bottom.g, bottom.b);
  colors.push(top.r, top.g, top.b, bottom.r, bottom.g, bottom.b, bottom.r, bottom.g, bottom.b);
}

export function buildTerrainGeometry(subjectTiles: readonly TileLike[], support: TileSupport, baseColor: THREE.Color): TerrainBuild {
  const positions: number[] = [];
  const colors: number[] = [];
  const rocks: TerrainRock[] = [];
  const subjectBounds = subjectTiles.map(buildTileBounds);
  const rockWarm = new THREE.Color('#7b6a58');
  const rockDark = new THREE.Color('#433930');
  const topColor = new THREE.Color();
  const bottomColor = new THREE.Color();
  // Collected while sides are added: computeBoundingBox and computeBoundingSphere would walk every vertex again.
  const box = new THREE.Box3();
  const segmentSize = TILE_CONSTANTS.GRID_CELL_SIZE;
  let castShadow = false;

  const addSide = (
    bounds: TileBounds,
    x0: number,
    z0: number,
    x1: number,
    z1: number,
    sampleX: number,
    sampleZ: number,
    outwardX: number,
    outwardZ: number,
    seed: number,
  ) => {
    const supportY = sampleSupportHeight(support, bounds.id, sampleX, sampleZ);
    if (bounds.topY <= supportY + 0.02) return;

    const drop = bounds.topY - supportY;
    if (drop >= SHADOW_CASTING_DROP) castShadow = true;
    const topTint = 0.72 + hashNoise(seed, bounds.centerX, bounds.centerZ) * 0.16;
    const bottomTint = 0.42 + hashNoise(seed, bounds.topY) * 0.08;
    topColor.copy(baseColor).lerp(rockWarm, 0.28 + Math.min(drop, 2) * 0.08).multiplyScalar(topTint);
    bottomColor.copy(baseColor).lerp(rockDark, 0.7).multiplyScalar(bottomTint);
    pushSideQuad(positions, colors, x0, z0, x1, z1, bounds.topY, supportY, topColor, bottomColor);
    box.expandByPoint(corner.set(x0, supportY, z0)).expandByPoint(corner.set(x1, bounds.topY, z1));

    if (drop < TILE_CONSTANTS.HEIGHT_STEP * 0.95) return;

    const rockChance = hashNoise(seed, supportY, drop);
    if (rockChance < 0.58) return;

    const midX = (x0 + x1) * 0.5;
    const midZ = (z0 + z1) * 0.5;
    const scaleBase = 0.12 + Math.min(drop, 2.5) * 0.06;
    const scaleJitter = 0.08 + rockChance * 0.08;

    rocks.push({
      position: [
        midX + outwardX * (0.18 + rockChance * 0.24),
        supportY + scaleBase * 0.65,
        midZ + outwardZ * (0.18 + rockChance * 0.24),
      ],
      rotation: [
        rockChance * Math.PI * 1.7,
        rockChance * Math.PI * 2.9,
        rockChance * Math.PI * 0.9,
      ],
      scale: [
        scaleBase + scaleJitter * 0.6,
        scaleBase * 0.9 + scaleJitter * 0.45,
        scaleBase + scaleJitter,
      ],
    });
  };

  for (const bounds of subjectBounds) {
    if (bounds.topY <= 0.02) continue;

    const tileSize = bounds.segments * segmentSize;
    const minOffset = -tileSize / 2;

    for (let i = 0; i < bounds.segments; i++) {
      const start = minOffset + i * segmentSize;
      const end = start + segmentSize;
      const segmentMid = start + segmentSize * 0.5;

      addSide(
        bounds,
        bounds.maxX,
        bounds.centerZ + start,
        bounds.maxX,
        bounds.centerZ + end,
        bounds.maxX + 0.02,
        bounds.centerZ + segmentMid,
        1,
        0,
        hashNoise(bounds.centerX, bounds.centerZ, i, 1),
      );

      addSide(
        bounds,
        bounds.minX,
        bounds.centerZ + end,
        bounds.minX,
        bounds.centerZ + start,
        bounds.minX - 0.02,
        bounds.centerZ + segmentMid,
        -1,
        0,
        hashNoise(bounds.centerX, bounds.centerZ, i, 2),
      );

      addSide(
        bounds,
        bounds.centerX + end,
        bounds.minZ,
        bounds.centerX + start,
        bounds.minZ,
        bounds.centerX + segmentMid,
        bounds.minZ - 0.02,
        0,
        -1,
        hashNoise(bounds.centerX, bounds.centerZ, i, 3),
      );

      addSide(
        bounds,
        bounds.centerX + start,
        bounds.maxZ,
        bounds.centerX + end,
        bounds.maxZ,
        bounds.centerX + segmentMid,
        bounds.maxZ + 0.02,
        0,
        1,
        hashNoise(bounds.centerX, bounds.centerZ, i, 4),
      );
    }
  }

  const sideGeometry = new THREE.BufferGeometry();
  if (positions.length > 0) {
    sideGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    sideGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    sideGeometry.computeVertexNormals();
    sideGeometry.boundingBox = box;
    sideGeometry.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
  }

  return { sideGeometry, rocks, castShadow };
}

export function shouldCloseStairBack(tile: TileLike, support: TileSupport): boolean {
  const { tileSize, totalHeight, rotation } = getStairLayout(tile);
  const [offsetX, offsetZ] = rotateXZ(0, tileSize / 2 + 0.04, rotation);
  const supportY = sampleSupportHeight(support, tile.id, tile.position.x + offsetX, tile.position.z + offsetZ);
  return supportY + 0.02 < totalHeight;
}
