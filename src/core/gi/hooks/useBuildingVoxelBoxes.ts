import { useEffect, useMemo, useState } from 'react';

import { useBuildingStore } from '../../building/stores/buildingStore';
import type { PlacedObject } from '../../building/types';
import type { Aabb, VoxelSourceBox } from '../types';
import { buildingToVoxelBoxes } from '../utils/buildingVoxelBoxes';
import { loadModelBounds } from '../utils/modelBounds';

const NO_BOUNDS: ReadonlyMap<string, Aabb | null> = new Map();

/** Bounding boxes of the placed models' files, filled in as each one is read (once per URL). */
function useModelBounds(objects: readonly PlacedObject[]): ReadonlyMap<string, Aabb | null> {
  const [bounds, setBounds] = useState(NO_BOUNDS);
  useEffect(() => {
    const missing = [
      ...new Set(objects.flatMap((object) => (object.type === 'model' && object.config?.modelUrl ? [object.config.modelUrl] : []))),
    ].filter((url) => !bounds.has(url));
    if (missing.length === 0) return undefined;
    let cancelled = false;
    void Promise.all(missing.map(async (url) => [url, await loadModelBounds(url)] as const)).then((loaded) => {
      if (cancelled) return;
      setBounds((current) => {
        const next = new Map(current);
        for (const [url, box] of loaded) next.set(url, box);
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [objects, bounds]);
  return bounds;
}

/**
 * The building store as GI voxel boxes: tiles, walls, blocks and fires, plus stand-ins for trees and placed models
 * once their files' bounds are known.
 */
export function useBuildingVoxelBoxes(): VoxelSourceBox[] {
  const meshes = useBuildingStore((state) => state.meshes);
  const tileGroups = useBuildingStore((state) => state.tileGroups);
  const wallGroups = useBuildingStore((state) => state.wallGroups);
  const blocks = useBuildingStore((state) => state.blocks);
  const objects = useBuildingStore((state) => state.objects);
  const bounds = useModelBounds(objects);
  return useMemo(
    () => buildingToVoxelBoxes({ meshes, tileGroups, wallGroups, blocks, objects }, bounds),
    [meshes, tileGroups, wallGroups, blocks, objects, bounds],
  );
}
