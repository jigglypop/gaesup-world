import { wallBox } from '../../model/footprint';
import type { WallConfig } from '../../types';
import type { BuildingColliderBox } from '../BuildingColliders/types';

export function createWallColliders(walls: readonly WallConfig[]): BuildingColliderBox[] {
  return walls.map((wall) => {
    const { center, half, rotationY } = wallBox(wall);
    return { key: wall.id, position: [...center], rotation: [0, rotationY, 0], args: [...half] };
  });
}
