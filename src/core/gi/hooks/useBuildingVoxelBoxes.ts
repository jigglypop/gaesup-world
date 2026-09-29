import { useMemo } from 'react';

import { useBuildingStore } from '../../building/stores/buildingStore';
import type { VoxelSourceBox } from '../types';
import { buildingToVoxelBoxes } from '../utils/buildingVoxelBoxes';

export function useBuildingVoxelBoxes(): VoxelSourceBox[] {
  const meshes = useBuildingStore((state) => state.meshes);
  const tileGroups = useBuildingStore((state) => state.tileGroups);
  const wallGroups = useBuildingStore((state) => state.wallGroups);
  const blocks = useBuildingStore((state) => state.blocks);
  const objects = useBuildingStore((state) => state.objects);
  return useMemo(
    () => buildingToVoxelBoxes({ meshes, tileGroups, wallGroups, blocks, objects }),
    [meshes, tileGroups, wallGroups, blocks, objects],
  );
}
