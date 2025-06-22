import { useMemo } from 'react';
import { useCameraEvents } from '../../internal/hooks/useCameraEvents';
import { useCameraFrame } from '../../internal/hooks/useCameraFrame';
import { useGaesupStore } from '@stores/gaesupStore';

export default function Camera() {
  const { cameraOption } = useCameraEvents();
  const controllerOptions = useGaesupStore((state) => state.controllerOptions);
  
  const frameProps = useMemo(() => ({
    controllerOptions,
  }), [controllerOptions]);
  
  useCameraFrame(frameProps, cameraOption);
  return null;
} 