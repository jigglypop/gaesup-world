import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { createCameraOptionSlice } from '@core/camera/stores/slices/cameraOption';

import {
  createModeSlice,
  createUrlsSlice,
  createRideableSlice,
  createPerformanceSlice,
  createPhysicsSlice,
  createSizesSlice,
} from './slices';
import { GaesupState } from './types';
import { createAnimationSlice } from '../animation/stores/slices';
import { createInteractionSlice } from '../interactions/stores/slices';
import { createWorldSlice } from '../world/stores/slices/worldStates/slice';

export const useGaesupStore = create<GaesupState>()(
  devtools(
    subscribeWithSelector(
      (...a) => ({
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
      })
    )
  )
);
