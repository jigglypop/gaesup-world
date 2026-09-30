import type { NavigationSystem } from '../navigation';
import { blockBox, boxBoundsXZ, cellSpan, tileBox, tileWorldSize, wallBox, wallKindOf, type BuildingBox } from './model/footprint';
import type {
  BuildingBlockConfig,
  BuildingWallKind,
  PlacedObject,
  TileConfig,
  TileGroupConfig,
  WallConfig,
  WallGroupConfig,
} from './types';
import { TILE_CONSTANTS } from './types/constants';

export type BuildingNavigationObstacleSource = {
  wallGroups?: Iterable<WallGroupConfig>;
  tileGroups?: Iterable<TileGroupConfig>;
  blocks?: Iterable<BuildingBlockConfig>;
  objects?: Iterable<PlacedObject>;
};

export type BuildingNavigationObstacleOptions = {
  includeTiles?: boolean;
  includeWalls?: boolean;
  includeBlocks?: boolean;
  includeObjects?: boolean;
  reset?: boolean;
  objectPadding?: number;
  wallPadding?: number;
};

/** Kinds whose colliders leave an opening to walk through; a railing's rails stop bodies at chest height. */
const NON_BLOCKING_WALL_KINDS = new Set<BuildingWallKind>(['door', 'arch']);

function isBlockingWall(wall: WallConfig, group: WallGroupConfig): boolean {
  return !NON_BLOCKING_WALL_KINDS.has(wallKindOf(wall, group));
}

function rotatedFootprint(width: number, depth: number, rotationY: number): { width: number; depth: number } {
  const cos = Math.abs(Math.cos(rotationY));
  const sin = Math.abs(Math.sin(rotationY));
  return {
    width: width * cos + depth * sin,
    depth: width * sin + depth * cos,
  };
}

function objectFootprint(object: PlacedObject, padding: number): { width: number; depth: number } {
  const size = Math.max(0.1, object.config?.size ?? object.config?.modelScale ?? 1);
  if (object.type === 'flag') {
    return {
      width: Math.max(0.2, object.config?.flagWidth ?? size) + padding,
      depth: 0.4 + padding,
    };
  }
  if (object.type === 'billboard') {
    return {
      width: Math.max(0.2, (object.config?.billboardWidth ?? 2) * (object.config?.billboardScale ?? 1)) + padding,
      depth: 0.5 + padding,
    };
  }
  if (object.type === 'fire') {
    const width = object.config?.fireWidth ?? size;
    const depth = object.config?.fireHeight ?? width;
    return { width: width + padding, depth: depth + padding };
  }
  return { width: size + padding, depth: size + padding };
}

function inverseRotateXZ(x: number, z: number, rotation: number): [number, number] {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return [x * cos - z * sin, x * sin + z * cos];
}

function tileTopHeight(tile: TileConfig): number {
  return Math.max(tile.position.y, TILE_CONSTANTS.HEIGHT_STEP);
}

function sampleTileHeight(tile: TileConfig, worldX: number, worldZ: number): number {
  const shape = tile.shape ?? 'box';
  if (shape === 'box' || shape === 'round') return tile.position.y;

  const size = tileWorldSize(tile);
  const half = size / 2;
  const rotation = tile.rotation ?? 0;
  const [localX, localZ] = inverseRotateXZ(
    worldX - tile.position.x,
    worldZ - tile.position.z,
    rotation,
  );
  if (Math.abs(localX) > half || Math.abs(localZ) > half) return tile.position.y;

  const progress = Math.max(0, Math.min(1, (localZ + half) / size));
  const height = tileTopHeight(tile);
  if (shape === 'stairs') {
    const stepCount = Math.max(4, Math.min(8, cellSpan(tile.size) * 4));
    return Math.ceil(progress * stepCount) / stepCount * height;
  }
  if (shape === 'ramp') {
    return progress * height;
  }

  return tile.position.y;
}

function applyTileNavigationHeights(navigation: NavigationSystem, tile: TileConfig): void {
  const { minX, maxX, minZ, maxZ } = boxBoundsXZ(tileBox(tile));
  navigation.setHeightSampler(
    (minX + maxX) / 2,
    (minZ + maxZ) / 2,
    maxX - minX,
    maxZ - minZ,
    (worldX, worldZ) => sampleTileHeight(tile, worldX, worldZ),
  );
}

/** Blocks the cells under a box, grown by `padding` in total along each axis. */
function blockUnderBox(navigation: NavigationSystem, box: BuildingBox, padding = 0): void {
  const { minX, maxX, minZ, maxZ } = boxBoundsXZ(box);
  navigation.setBlocked((minX + maxX) / 2, (minZ + maxZ) / 2, maxX - minX + padding, maxZ - minZ + padding);
}

export function applyBuildingNavigationObstacles(
  navigation: NavigationSystem,
  source: BuildingNavigationObstacleSource,
  options: BuildingNavigationObstacleOptions = {},
): number {
  if (options.reset) {
    navigation.reset();
  }

  let applied = 0;
  const includeTiles = options.includeTiles ?? true;
  const includeWalls = options.includeWalls ?? true;
  const includeBlocks = options.includeBlocks ?? true;
  const includeObjects = options.includeObjects ?? true;
  const wallPadding = options.wallPadding ?? 0;
  const objectPadding = options.objectPadding ?? 0;

  if (includeTiles) {
    for (const group of source.tileGroups ?? []) {
      for (const tile of group.tiles) {
        applyTileNavigationHeights(navigation, tile);
        applied += 1;
      }
    }
  }

  if (includeWalls) {
    for (const group of source.wallGroups ?? []) {
      for (const wall of group.walls) {
        if (!isBlockingWall(wall, group)) continue;
        blockUnderBox(navigation, wallBox(wall), wallPadding);
        applied += 1;
      }
    }
  }

  if (includeBlocks) {
    for (const block of source.blocks ?? []) {
      blockUnderBox(navigation, blockBox(block));
      applied += 1;
    }
  }

  if (includeObjects) {
    for (const object of source.objects ?? []) {
      const baseFootprint = objectFootprint(object, objectPadding);
      const footprint = rotatedFootprint(
        baseFootprint.width,
        baseFootprint.depth,
        object.rotation ?? 0,
      );
      navigation.setBlocked(object.position.x, object.position.z, footprint.width, footprint.depth);
      applied += 1;
    }
  }

  return applied;
}
