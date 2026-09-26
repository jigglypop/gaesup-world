import { wallSolidBoxes } from '../../model/footprint';
import type { WallGroupConfig } from '../../types';
import type { BuildingColliderBox } from '../BuildingColliders/types';

/** One box per solid wall part: a door or arch keeps its opening free. */
export function createWallColliders(group: Pick<WallGroupConfig, 'walls' | 'defaultWallKind'>): BuildingColliderBox[] {
  return group.walls.flatMap((wall) => {
    const boxes = wallSolidBoxes(wall, group);
    return boxes.map(({ center, half, rotationY }, index) => ({
      key: boxes.length === 1 ? wall.id : `${wall.id}:${index}`,
      position: [...center],
      rotation: [0, rotationY, 0],
      args: [...half],
    }));
  });
}
