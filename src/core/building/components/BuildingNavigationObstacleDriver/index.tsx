import { useEffect } from 'react';

import type { NavigationSystem } from '../../../navigation';
import { applyRegisteredNavigationObstacles } from '../../../navigation';
import {
  applyBuildingNavigationObstacles,
  type BuildingNavigationObstacleOptions,
} from '../../navigation';
import { useBuildingStore } from '../../stores/buildingStore';

export type BuildingNavigationObstacleDriverProps = BuildingNavigationObstacleOptions & {
  navigation: NavigationSystem;
  enabled?: boolean;
};

export function BuildingNavigationObstacleDriver({
  navigation,
  enabled = true,
  includeWalls,
  includeTiles,
  includeBlocks,
  includeObjects,
  reset = true,
  objectPadding,
  wallPadding,
}: BuildingNavigationObstacleDriverProps) {
  const wallGroups = useBuildingStore((state) => state.wallGroups);
  const tileGroups = useBuildingStore((state) => state.tileGroups);
  const blocks = useBuildingStore((state) => state.blocks);
  const objects = useBuildingStore((state) => state.objects);

  useEffect(() => {
    if (!enabled) return;
    applyBuildingNavigationObstacles(
      navigation,
      {
        wallGroups: wallGroups.values(),
        tileGroups: tileGroups.values(),
        blocks,
        objects,
      },
      {
        reset,
        ...(includeTiles !== undefined ? { includeTiles } : {}),
        ...(includeWalls !== undefined ? { includeWalls } : {}),
        ...(includeBlocks !== undefined ? { includeBlocks } : {}),
        ...(includeObjects !== undefined ? { includeObjects } : {}),
        ...(objectPadding !== undefined ? { objectPadding } : {}),
        ...(wallPadding !== undefined ? { wallPadding } : {}),
      },
    );
    applyRegisteredNavigationObstacles(navigation);
  }, [
    blocks,
    enabled,
    includeBlocks,
    includeObjects,
    includeTiles,
    includeWalls,
    navigation,
    objectPadding,
    objects,
    reset,
    tileGroups,
    wallGroups,
    wallPadding,
  ]);

  return null;
}

export default BuildingNavigationObstacleDriver;
