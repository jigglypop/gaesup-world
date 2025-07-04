import { GaesupWorldSlice } from '@core/world/stores/types';
import { ModeSlice } from './slices/mode';
import { UrlsSlice } from './slices/urls';
import { SizeSlice } from './slices/sizes';
import { RideableSlice } from './slices/rideable';
import { PerformanceSlice } from './slices/performance';
import { CameraOptionSlice } from '@core/camera/stores/slices/cameraOption';
import { PhysicsSlice } from './slices/mode copy';

export type GaesupState = GaesupWorldSlice &
  ModeSlice &
  UrlsSlice &
  SizeSlice &
  RideableSlice &
  PerformanceSlice &
  CameraOptionSlice &
  PhysicsSlice;

export * from './slices/mode/types';
export * from './slices/urls/types';
export * from './slices/sizes/types';
export * from './slices/rideable/types';
export * from './slices/performance/types';
