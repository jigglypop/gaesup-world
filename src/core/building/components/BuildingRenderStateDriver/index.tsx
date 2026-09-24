import { useEffect, useMemo, useRef } from 'react';

import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../../runtime/runtimeContext';
import { createBuildingRenderSnapshotBuilder } from '../../render/core';
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
  const buildSnapshot = useMemo(createBuildingRenderSnapshotBuilder, []);

  const snapshot = useMemo(
    () => buildSnapshot(
      { wallGroups: wallGroups.values(), tileGroups: tileGroups.values(), blocks: blocks ?? [], objects },
      versionRef.current++,
    ),
    [buildSnapshot, wallGroups, tileGroups, blocks, objects],
  );

  useEffect(() => {
    if (runtime && !runtime.isActive()) return;
    setSnapshot(snapshot);
  }, [snapshot, setSnapshot, runtime, runtimeRevision]);

  useEffect(() => reset, [reset]);

  return null;
}

export default BuildingRenderStateDriver;
