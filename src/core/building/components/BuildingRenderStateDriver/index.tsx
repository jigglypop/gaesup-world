import { useEffect, useMemo, useRef } from 'react';

import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../../runtime/runtimeContext';
import { buildBuildingRenderSnapshot } from '../../render/core';
import { useBuildingRenderStateStore } from '../../render/store';
import { useBuildingStore } from '../../stores/buildingStore';

export function BuildingRenderStateDriver() {
  const runtime = useGaesupRuntime();
  const runtimeRevision = useGaesupRuntimeRevision();
  const wallGroups = useBuildingStore((s) => s.wallGroups);
  const tileGroups = useBuildingStore((s) => s.tileGroups);
  const blocks = useBuildingStore((s) => s.blocks);
  const objects = useBuildingStore((s) => s.objects);
  const setSnapshot = useBuildingRenderStateStore((s) => s.setSnapshot);
  const reset = useBuildingRenderStateStore((s) => s.reset);
  const versionRef = useRef(1);

  const snapshot = useMemo(
    () =>
      buildBuildingRenderSnapshot({
        wallGroups: Array.from(wallGroups.values()),
        tileGroups: Array.from(tileGroups.values()),
        blocks: blocks ?? [],
        objects,
        version: versionRef.current++,
      }),
    [wallGroups, tileGroups, blocks, objects],
  );

  useEffect(() => {
    if (runtime && !runtime.isActive()) return;
    setSnapshot(snapshot);
  }, [snapshot, setSnapshot, runtime, runtimeRevision]);

  useEffect(() => reset, [reset]);

  return null;
}

export default BuildingRenderStateDriver;
