import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  createModeSlice,
  createUrlsSlice,
  createRideableSlice,
  createPerformanceSlice,
  createPhysicsSlice,
  createSizesSlice,
} from './slices';
import { GaesupState } from './types';
import { createCameraOptionSlice } from '@core/camera/stores/slices/cameraOption';
import { createAnimationSlice } from '../animation/stores/slices';
import { createInteractionSlice } from '../interactions/stores/slices';
import { createWorldSlice } from '../world/stores/slices/worldStates/slice';

export const useGaesupStore = create<GaesupState>()(
  devtools(
    subscribeWithSelector(
      immer((...a) => ({
        ...createModeSlice(...a),
        ...createUrlsSlice(...a),
        ...createSizesSlice(...a),
        ...createRideableSlice(...a),
        ...createPerformanceSlice(...a),
        ...createCameraOptionSlice(...a),
        ...createPhysicsSlice(...a),
        ...createAnimationSlice(...a),
        ...createInteractionSlice(...a),
        ...createWorldSlice(...a),
      }))
    )
  )
);
