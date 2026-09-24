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

type MergeCell = { i: number; j: number; id: string };
type MergeLayer = { phaseX: number; phaseZ: number; y: number; cells: MergeCell[] };

function latticePhase(value: number, cell: number): number {
  const phase = Math.round((((value % cell) + cell) % cell) * 1000) / 1000;
  return phase >= cell ? 0 : phase;
}

function isRightAngle(rotation: number): boolean {
  const quarters = rotation / (Math.PI / 2);
  return Math.abs(quarters - Math.round(quarters)) < 1e-6;
}

function flatBoxCollider(key: string, x: number, y: number, z: number, halfX: number, halfZ: number, rotation: number): BuildingColliderBox {
  const elevated = y > ELEVATED_TILE_MIN_Y;
  return {
    key,
    position: [x, elevated ? y * 0.5 : -FLAT_TILE_HALF_HEIGHT, z],
    rotation: [0, rotation, 0],
    args: [halfX, elevated ? y * 0.5 : FLAT_TILE_HALF_HEIGHT, halfZ],
  };
}

/**
 * Same-height, unit-size, axis-aligned box tiles on one lattice become rectangles: runs along each row, then
 * equal runs in consecutive rows merge. A 20x20 floor is one collider instead of 400.
 */
function pushMergedBoxColliders(colliders: BuildingColliderBox[], layers: Map<string, MergeLayer>): void {
  const cell = TILE_CONSTANTS.GRID_CELL_SIZE;
  for (const { phaseX, phaseZ, y, cells } of layers.values()) {
    cells.sort((a, b) => a.j - b.j || a.i - b.i);
    type Rect = { i0: number; i1: number; j0: number; j1: number; id: string; count: number };
    const rects: Rect[] = [];
    let open = new Map<string, Rect>();
    for (let k = 0; k < cells.length;) {
      const j = cells[k]!.j;
      const next = new Map<string, Rect>();
      while (k < cells.length && cells[k]!.j === j) {
        const start = cells[k]!;
        let end = start.i;
        k++;
        while (k < cells.length && cells[k]!.j === j && cells[k]!.i === end + 1) end = cells[k++]!.i;
        const key = `${start.i}:${end}`;
        const above = open.get(key);
        if (above && above.j1 === j - 1) {
          above.j1 = j;
          above.count += end - start.i + 1;
          next.set(key, above);
        } else {
          const rect = { i0: start.i, i1: end, j0: j, j1: j, id: start.id, count: end - start.i + 1 };
          rects.push(rect);
          next.set(key, rect);
        }
      }
      open = next;
    }
    for (const rect of rects) {
      colliders.push(flatBoxCollider(
        rect.count === 1 ? rect.id : `${rect.id}:x${rect.count}`,
        phaseX + ((rect.i0 + rect.i1) / 2) * cell, y, phaseZ + ((rect.j0 + rect.j1) / 2) * cell,
        ((rect.i1 - rect.i0 + 1) * cell) / 2, ((rect.j1 - rect.j0 + 1) * cell) / 2, 0,
      ));
    }
  }
}

export function createTileColliders(tiles: readonly TileConfig[]): BuildingColliderBox[] {
  const colliders: BuildingColliderBox[] = [];
  const layers = new Map<string, MergeLayer>();
  const cell = TILE_CONSTANTS.GRID_CELL_SIZE;

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

    const rotation = tile.rotation ?? 0;
    if ((tile.size || 1) === 1 && isRightAngle(rotation)) {
      const phaseX = latticePhase(tile.position.x, cell);
      const phaseZ = latticePhase(tile.position.z, cell);
      const key = `${phaseX}|${phaseZ}|${tile.position.y}`;
      let layer = layers.get(key);
      if (!layer) {
        layer = { phaseX, phaseZ, y: tile.position.y, cells: [] };
        layers.set(key, layer);
      }
      layer.cells.push({ i: Math.round((tile.position.x - phaseX) / cell), j: Math.round((tile.position.z - phaseZ) / cell), id: tile.id });
      continue;
    }
    colliders.push(flatBoxCollider(tile.id, tile.position.x, tile.position.y, tile.position.z, tileSize / 2, tileSize / 2, rotation));
  }

  pushMergedBoxColliders(colliders, layers);
  return colliders;
}
