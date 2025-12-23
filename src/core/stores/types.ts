import { CameraOptionSlice } from '@core/camera/stores/slices/cameraOption';
import { AnimationSlice } from '@core/animation/stores/types';
import { InteractionActions, InteractionSliceState } from '@core/interactions/stores/types';
import { WorldSlice as WorldStateSlice } from '@core/world/stores/slices/worldStates/types';

import { ModeSlice } from './slices/mode';
import { PerformanceState } from './slices/performance';
import { PhysicsSlice } from './slices/physics';
import { RideableSlice } from './slices/rideable';
import { SizesSlice } from './slices/sizes';
import { UrlsSlice } from './slices/urls';

type AnimationStoreSlice = Omit<AnimationSlice, 'getAnimation' | 'getCurrentAnimation'>;

export type GaesupState =
  ModeSlice &
  UrlsSlice &
  SizesSlice &
  RideableSlice &
  PerformanceState &
  CameraOptionSlice &
  PhysicsSlice &
  AnimationStoreSlice &
  (InteractionSliceState & InteractionActions) &
  WorldStateSlice;

export type StoreState = GaesupState;

export * from './slices/mode/types';
export * from './slices/urls/types';
export * from './slices/sizes/types';
export * from './slices/rideable/types';
export * from './slices/performance/types';
