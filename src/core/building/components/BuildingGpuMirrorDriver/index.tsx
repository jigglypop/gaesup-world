import { useEffect, useRef } from 'react';

import { buildBuildingGpuMirror } from '../../render/gpu';
import { useBuildingRenderStateStore } from '../../render/store';

export function BuildingGpuMirrorDriver() {
  const snapshot = useBuildingRenderStateStore((s) => s.snapshot);
  const setGpuMirror = useBuildingRenderStateStore((s) => s.setGpuMirror);
  const previousRef = useRef(useBuildingRenderStateStore.getState().gpuMirror);

  useEffect(() => {
    const nextMirror = buildBuildingGpuMirror(snapshot, previousRef.current);
    previousRef.current = nextMirror;
    setGpuMirror(nextMirror);
  }, [snapshot, setGpuMirror]);

  return null;
}

export default BuildingGpuMirrorDriver;
