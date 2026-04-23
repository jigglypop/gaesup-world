import { useEffect, useRef } from 'react';

import { useBuildingGpuCullingStore } from '../../render/cullingStore';
import { buildBuildingIndirectDrawMirror } from '../../render/draw';
import { useBuildingRenderStateStore } from '../../render/store';

export function BuildingIndirectDrawDriver() {
  const version = useBuildingGpuCullingStore((s) => s.version);
  const clusterCounts = useBuildingGpuCullingStore((s) => s.clusterCounts);
  const setDrawMirror = useBuildingRenderStateStore((s) => s.setDrawMirror);
  const previousRef = useRef(useBuildingRenderStateStore.getState().drawMirror);

  useEffect(() => {
    if (version === 0 || clusterCounts.length === 0) return;
    const next = buildBuildingIndirectDrawMirror(version, clusterCounts, previousRef.current);
    previousRef.current = next;
    setDrawMirror(next);
  }, [version, clusterCounts, setDrawMirror]);

  return null;
}

export default BuildingIndirectDrawDriver;
