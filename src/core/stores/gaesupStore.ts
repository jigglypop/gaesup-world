import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { createUrlsSlice } from './slices/urls';
import { createModeSlice } from './slices/mode';
import { createCameraOptionSlice } from '../camera/stores/slices/cameraOption';
import { createSizesSlice } from './slices/sizes';
import { createAnimationSlice } from '../animation/stores/slices';
import { createInteractionSlice } from '../interactions/stores/slices';
import { createRideableSlice } from './slices/rideable/slice';
import { createPerformanceSlice } from './slices/performance';
import { StoreState } from './types';
import { createWorldSlice } from '../world/stores/slices/worldStates/slice';

export const useGaesupStore = create<StoreState>()(
  devtools(
    subscribeWithSelector((set, get, api) => ({
      ...createUrlsSlice(set, get, api),
      ...createModeSlice(set, get, api),
      ...createCameraOptionSlice(set, get, api),
      ...createSizesSlice(set, get, api),
      ...createAnimationSlice(set, get, api),
      ...createInteractionSlice(set, get, api),
      ...createRideableSlice(set, get, api),
      ...createPerformanceSlice(set, get, api),
      ...createWorldSlice(set, get, api),
      updateState: (updates: Partial<StoreState>) => {
        set((state) => ({ ...state, ...updates }));
      },
      initialize: (config: Partial<StoreState>) => {
        const state = get();
        if (config.mode) state.setMode(config.mode);
        if (config.urls) state.setUrls(config.urls);
        if (config.cameraOption) state.setCameraOption(config.cameraOption);
      },
    })),
  ),
);
