import { useCameraEvents } from './hooks/useCameraEvents';
import { useCameraFrame } from './hooks/useCameraFrame';
import { CameraPropType } from '../types';

export default function Camera(prop: Omit<CameraPropType, 'cameraOption' | 'state'>) {
  const { cameraOption } = useCameraEvents();
  useCameraFrame(prop, cameraOption);
  return null;
}

export * from './blend/CameraBlendManager';
export * from '../systems/SmartCollisionSystem';
export * from './effects/CameraEffects';
