import type { WallConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import type { BuildingColliderBox } from '../BuildingColliders/types';

export function createWallColliders(walls: readonly WallConfig[]): BuildingColliderBox[] {
  const { WIDTH: width, HEIGHT: height, THICKNESS: depth } = TILE_CONSTANTS.WALL_SIZES;
  const halfWidth = width / 2;
  return walls.map((wall) => ({
    key: wall.id,
    position: [
      wall.position.x + Math.sin(wall.rotation.y) * halfWidth,
      wall.position.y + height / 2,
      wall.position.z + Math.cos(wall.rotation.y) * halfWidth,
    ],
    rotation: [0, wall.rotation.y, 0],
    args: [halfWidth, height / 2, depth / 2],
  }));
}
