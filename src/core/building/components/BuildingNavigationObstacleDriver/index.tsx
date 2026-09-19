import { useEffect, useSyncExternalStore } from 'react';

import type { NavigationSystem } from '../../../navigation';
import { useNavigationObstacleRegistry } from '../../../navigation';
import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../../runtime/runtimeContext';
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
  const obstacles = useNavigationObstacleRegistry();
  const obstacleRevision = useSyncExternalStore(obstacles.subscribe, obstacles.getRevision, obstacles.getRevision);
  const runtime = useGaesupRuntime();
  const runtimeRevision = useGaesupRuntimeRevision();

  useEffect(() => {
    if (!enabled || (runtime && !runtime.isActive())) return;
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
    obstacles.applyRegisteredNavigationObstacles(navigation);
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
    obstacles, obstacleRevision, runtime, runtimeRevision,
  ]);

  return null;
}

export default BuildingNavigationObstacleDriver;
