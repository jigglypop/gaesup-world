import { useEffect } from 'react';

import { useBuildingGpuCullingStore } from '../../render/cullingStore';
import { buildBuildingIndirectDrawMirror } from '../../render/draw';
import { useBuildingRenderStateStore, useBuildingRenderStateStoreApi } from '../../render/store';

export function BuildingIndirectDrawDriver() {
  const renderStore = useBuildingRenderStateStoreApi();
  const version = useBuildingGpuCullingStore((s) => s.version);
  const clusterCounts = useBuildingGpuCullingStore((s) => s.clusterCounts);
  const setDrawMirror = useBuildingRenderStateStore((s) => s.setDrawMirror);

  useEffect(() => {
    if (version === 0 || clusterCounts.length === 0) return;
    const next = buildBuildingIndirectDrawMirror(version, clusterCounts, renderStore.getState().drawMirror);
    setDrawMirror(next);
  }, [renderStore, version, clusterCounts, setDrawMirror]);

  return null;
}

export default BuildingIndirectDrawDriver;
