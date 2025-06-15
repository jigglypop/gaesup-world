import { useCameraEvents } from './hooks/useCameraEvents';
import { useCameraFrame } from './hooks/useCameraFrame';
import { CameraPropType } from '../types';

export default function Camera(prop: Omit<CameraPropType, 'cameraOption' | 'state'>) {
  const { cameraOption, setCameraOption } = useCameraEvents();
  const managers = useCameraFrame(prop, cameraOption, setCameraOption);
  return managers;
}

export * from './blend/CameraBlendManager';
export * from '../systems/SmartCollisionSystem';
export * from './effects/CameraEffects';
export * from './debug/CameraDebugHelper';
