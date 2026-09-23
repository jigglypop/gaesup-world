import { useEffect } from 'react';

import { buildBuildingGpuMirror } from '../../render/gpu';
import { useBuildingRenderStateStore, useBuildingRenderStateStoreApi } from '../../render/store';

export function BuildingGpuMirrorDriver() {
  const renderStore = useBuildingRenderStateStoreApi();
  const snapshot = useBuildingRenderStateStore((s) => s.snapshot);
  const setGpuMirror = useBuildingRenderStateStore((s) => s.setGpuMirror);

  useEffect(() => {
    const nextMirror = buildBuildingGpuMirror(snapshot, renderStore.getState().gpuMirror);
    setGpuMirror(nextMirror);
  }, [renderStore, snapshot, setGpuMirror]);

  return null;
}

export default BuildingGpuMirrorDriver;
