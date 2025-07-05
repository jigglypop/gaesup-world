import { ModeSlice } from './slices/mode';
import { UrlsSlice } from './slices/urls';
import { SizesSlice } from './slices/sizes';
import { RideableSlice } from './slices/rideable';
import { PerformanceState } from './slices/performance';
import { CameraOptionSlice } from '@core/camera/stores/slices/cameraOption';
import { PhysicsSlice } from './slices/mode copy';

export type GaesupState = 
  ModeSlice &
  UrlsSlice &
  SizesSlice &
  RideableSlice &
  PerformanceState &
  CameraOptionSlice &
  PhysicsSlice;

export * from './slices/mode/types';
export * from './slices/urls/types';
export * from './slices/sizes/types';
export * from './slices/rideable/types';
export * from './slices/performance/types';
