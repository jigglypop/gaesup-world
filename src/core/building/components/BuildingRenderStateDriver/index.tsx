import { useEffect, useMemo, useRef } from 'react';

import { useBuildingStore } from '../../stores/buildingStore';
import { buildBuildingRenderSnapshot } from '../../render/core';
import { useBuildingRenderStateStore } from '../../render/store';

export function BuildingRenderStateDriver() {
  const wallGroups = useBuildingStore((s) => s.wallGroups);
  const tileGroups = useBuildingStore((s) => s.tileGroups);
  const objects = useBuildingStore((s) => s.objects);
  const setSnapshot = useBuildingRenderStateStore((s) => s.setSnapshot);
  const reset = useBuildingRenderStateStore((s) => s.reset);
  const versionRef = useRef(1);

  const snapshot = useMemo(
    () =>
      buildBuildingRenderSnapshot({
        wallGroups: Array.from(wallGroups.values()),
        tileGroups: Array.from(tileGroups.values()),
        objects,
        version: versionRef.current++,
      }),
    [wallGroups, tileGroups, objects],
  );

  useEffect(() => {
    setSnapshot(snapshot);
  }, [snapshot, setSnapshot]);

  useEffect(() => reset, [reset]);

  return null;
}

export default BuildingRenderStateDriver;
