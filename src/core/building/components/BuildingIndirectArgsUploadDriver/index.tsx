import { useEffect, useRef } from 'react';

import { useThree } from '@react-three/fiber';

import { useBuildingRenderStateStore } from '../../render/store';
import {
  createEmptyBuildingGpuUploadResources,
  getWebGPUDeviceFromRenderer,
  syncBuildingIndirectArgsBuffer,
} from '../../render/upload';

export function BuildingIndirectArgsUploadDriver() {
  const gl = useThree((s) => s.gl);
  const drawMirror = useBuildingRenderStateStore((s) => s.drawMirror);
  const setUploadResources = useBuildingRenderStateStore((s) => s.setUploadResources);
  const resourcesRef = useRef(useBuildingRenderStateStore.getState().uploadResources ?? createEmptyBuildingGpuUploadResources());

  useEffect(() => {
    resourcesRef.current = useBuildingRenderStateStore.getState().uploadResources;
  });

  useEffect(() => {
    if (drawMirror.version === 0) return;
    const device = getWebGPUDeviceFromRenderer(gl);
    if (!device) return;
    resourcesRef.current = syncBuildingIndirectArgsBuffer(device, resourcesRef.current, drawMirror);
    setUploadResources(resourcesRef.current);
  }, [gl, drawMirror, setUploadResources]);

  return null;
}

export default BuildingIndirectArgsUploadDriver;
