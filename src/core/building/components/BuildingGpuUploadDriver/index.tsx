import { useEffect, useRef } from 'react';

import { useThree } from '@react-three/fiber';

import {
  createEmptyBuildingGpuUploadResources,
  destroyBuildingGpuUploadResources,
  getWebGPUDeviceFromRenderer,
  syncBuildingGpuBuffers,
} from '../../render/upload';
import { useBuildingRenderStateStore } from '../../render/store';

export function BuildingGpuUploadDriver() {
  const gl = useThree((s) => s.gl);
  const gpuMirror = useBuildingRenderStateStore((s) => s.gpuMirror);
  const setUploadResources = useBuildingRenderStateStore((s) => s.setUploadResources);
  const resourcesRef = useRef(createEmptyBuildingGpuUploadResources());

  useEffect(() => {
    if (gpuMirror.version === 0) return;
    const device = getWebGPUDeviceFromRenderer(gl);
    if (!device) return;
    resourcesRef.current = syncBuildingGpuBuffers(device, resourcesRef.current, gpuMirror);
    setUploadResources(resourcesRef.current);
  }, [gl, gpuMirror, setUploadResources]);

  useEffect(() => {
    return () => {
      destroyBuildingGpuUploadResources(resourcesRef.current);
      resourcesRef.current = createEmptyBuildingGpuUploadResources();
      setUploadResources(resourcesRef.current);
    };
  }, [setUploadResources]);

  return null;
}

export default BuildingGpuUploadDriver;
