import type { TileConfig, TileShapeType } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import type { BuildingColliderBox } from '../BuildingColliders/types';

const ROUND_RING_COUNT = 4;
const ROUND_CORE_RATIO = 0.46;
const ROUND_RING_RADIUS_RATIO = 0.82;
const ROUND_RING_DEPTH_RATIO = 0.34;
const ELEVATED_TILE_MIN_Y = 0.02;
const FLAT_TILE_HALF_HEIGHT = 0.02;
const FLAT_ROUND_TILE_HEIGHT = 0.04;

export function getTileShape(tile: TileConfig): TileShapeType {
  return tile.shape ?? 'box';
}

export function rotateXZ(x: number, z: number, rotation: number): [number, number] {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return [x * cos + z * sin, z * cos - x * sin];
}

export function getStairLayout(tile: TileConfig) {
  const tileSize = (tile.size || 1) * TILE_CONSTANTS.GRID_CELL_SIZE;
  const stepCount = Math.max(4, Math.min(8, (tile.size || 1) * 4));
  const totalHeight = Math.max(tile.position.y, TILE_CONSTANTS.HEIGHT_STEP);
  const stepHeight = totalHeight / stepCount;
  const stepDepth = tileSize / stepCount;
  const colliderSlices = Math.max(stepCount * 4, Math.ceil(totalHeight / 0.08));
  const rotation = tile.rotation ?? 0;

  return { tileSize, stepCount, totalHeight, stepHeight, stepDepth, colliderSlices, rotation };
}

export function getRampLayout(tile: TileConfig) {
  const tileSize = (tile.size || 1) * TILE_CONSTANTS.GRID_CELL_SIZE;
  const rampSlices = Math.max(12, Math.min(24, Math.ceil(tileSize / 0.25)));
  const totalHeight = Math.max(tile.position.y, TILE_CONSTANTS.HEIGHT_STEP);
  const sliceHeight = totalHeight / rampSlices;
  const sliceDepth = tileSize / rampSlices;
  const rotation = tile.rotation ?? 0;

  return { tileSize, rampSlices, totalHeight, sliceHeight, sliceDepth, rotation };
}

function pushSlicedColliders(
  colliders: BuildingColliderBox[],
  tile: TileConfig,
  keyPrefix: string,
  tileSize: number,
  slices: number,
  sliceHeight: number,
  rotation: number,
): void {
  const sliceDepth = tileSize / slices;
  for (let i = 0; i < slices; i++) {
    const colliderHeight = sliceHeight * (i + 1);
    const localZ = -tileSize / 2 + sliceDepth * i + sliceDepth / 2;
    const [offsetX, offsetZ] = rotateXZ(0, localZ, rotation);
    colliders.push({
      key: `${keyPrefix}${i}`,
      position: [tile.position.x + offsetX, colliderHeight / 2, tile.position.z + offsetZ],
      rotation: [0, rotation, 0],
      args: [tileSize / 2, colliderHeight / 2, sliceDepth / 2],
    });
  }
}

export function createTileColliders(tiles: readonly TileConfig[]): BuildingColliderBox[] {
  const colliders: BuildingColliderBox[] = [];

  for (const tile of tiles) {
    const shape = getTileShape(tile);

    if (shape === 'stairs') {
      const { tileSize, totalHeight, colliderSlices, rotation } = getStairLayout(tile);
      pushSlicedColliders(colliders, tile, `${tile.id}-stair-collider-`, tileSize, colliderSlices, totalHeight / colliderSlices, rotation);
      continue;
    }

    if (shape === 'ramp') {
      const { tileSize, rampSlices, sliceHeight, rotation } = getRampLayout(tile);
      pushSlicedColliders(colliders, tile, `${tile.id}-ramp-`, tileSize, rampSlices, sliceHeight, rotation);
      continue;
    }

    const tileSize = (tile.size || 1) * TILE_CONSTANTS.GRID_CELL_SIZE;
    const elevated = tile.position.y > ELEVATED_TILE_MIN_Y;

    if (shape === 'round') {
      const colliderHeight = elevated ? tile.position.y : FLAT_ROUND_TILE_HEIGHT;
      const centerY = elevated ? colliderHeight / 2 : -FLAT_TILE_HALF_HEIGHT;
      const radius = tileSize / 2;

      colliders.push({
        key: `${tile.id}-core`,
        position: [tile.position.x, centerY, tile.position.z],
        rotation: [0, 0, 0],
        args: [radius * ROUND_CORE_RATIO, colliderHeight / 2, radius * ROUND_CORE_RATIO],
      });
      for (let i = 0; i < ROUND_RING_COUNT; i++) {
        colliders.push({
          key: `${tile.id}-ring-${i}`,
          position: [tile.position.x, centerY, tile.position.z],
          rotation: [0, (Math.PI / ROUND_RING_COUNT) * i, 0],
          args: [radius * ROUND_RING_RADIUS_RATIO, colliderHeight / 2, radius * ROUND_RING_DEPTH_RATIO],
        });
      }
      continue;
    }

    colliders.push({
      key: tile.id,
      position: [tile.position.x, elevated ? tile.position.y * 0.5 : -FLAT_TILE_HALF_HEIGHT, tile.position.z],
      rotation: [0, tile.rotation ?? 0, 0],
      args: [tileSize / 2, elevated ? tile.position.y * 0.5 : FLAT_TILE_HALF_HEIGHT, tileSize / 2],
    });
  }

  return colliders;
}
