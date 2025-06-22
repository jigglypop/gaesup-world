import { useCameraEvents } from './hooks/useCameraEvents';
import { useCameraFrame } from './hooks/useCameraFrame';
import { useGaesupStore } from '@stores/gaesupStore';

export default function Camera() {
  const { cameraOption } = useCameraEvents();
  const controllerOptions = useGaesupStore((state) => state.controllerOptions);
  const prop = {
    controllerOptions,
  };
  useCameraFrame(prop, cameraOption);
  return null;
}

export * from './blend/CameraBlendManager';
export * from '../systems/SmartCollisionSystem';
export * from './effects/CameraEffects';
