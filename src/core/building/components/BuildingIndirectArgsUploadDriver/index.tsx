import { useEffect } from 'react';

import { useThree } from '@react-three/fiber';

import { useBuildingRenderStateStore } from '../../render/store';
import { getWebGPUDeviceFromRenderer, syncBuildingIndirectArgsBuffer } from '../../render/upload';

export function BuildingIndirectArgsUploadDriver() {
  const gl = useThree((s) => s.gl);
  const drawMirror = useBuildingRenderStateStore((s) => s.drawMirror);
  const setUploadResources = useBuildingRenderStateStore((s) => s.setUploadResources);

  useEffect(() => {
    if (drawMirror.version === 0) return;
    const device = getWebGPUDeviceFromRenderer(gl);
    if (!device) return;
    setUploadResources((previous) => syncBuildingIndirectArgsBuffer(device, previous, drawMirror));
  }, [gl, drawMirror, setUploadResources]);

  return null;
}

export default BuildingIndirectArgsUploadDriver;
