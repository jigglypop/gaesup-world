import { useEffect } from 'react';

import { useThree } from '@react-three/fiber';

import { useBuildingRenderStateStore } from '../../render/store';
import { getWebGPUDeviceFromRenderer, syncBuildingGpuBuffers } from '../../render/upload';

export function BuildingGpuUploadDriver() {
  const gl = useThree((s) => s.gl);
  const gpuMirror = useBuildingRenderStateStore((s) => s.gpuMirror);
  const setUploadResources = useBuildingRenderStateStore((s) => s.setUploadResources);
  const releaseUploadResources = useBuildingRenderStateStore((s) => s.releaseUploadResources);

  useEffect(() => {
    if (gpuMirror.version === 0) return;
    const device = getWebGPUDeviceFromRenderer(gl);
    if (!device) return;
    setUploadResources((previous) => syncBuildingGpuBuffers(device, previous, gpuMirror));
  }, [gl, gpuMirror, setUploadResources]);

  useEffect(() => releaseUploadResources, [releaseUploadResources]);

  return null;
}

export default BuildingGpuUploadDriver;
