import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { createUrlsSlice } from './slices/urls';
import { createModeSlice } from './slices/mode';
import { createBlockSlice } from './slices/block';
import { createCameraOptionSlice } from '../camera/stores/slices/cameraOption';
import { createCameraSlice } from '../camera/stores/slices/camera';
import { createMinimapSlice } from './slices/minimap/slice';
import { createSizesSlice } from './slices/sizes';
import { createAnimationSlice } from '../animation/stores/slices';
import { createMotionSlice } from '../motions/stores/slices';
import { createInteractionSlice } from '../interactions/stores/slices';
import { createGameStatesSlice } from './slices/gameStates/slice';
import { createRideableSlice } from './slices/rideable/slice';
import { createActiveStateSlice } from './slices/activeState/slice';
import { StoreState } from './types';

export const useGaesupStore = create<StoreState>()(
  devtools(
    subscribeWithSelector((set, get, api) => ({
      ...createUrlsSlice(set, get, api),
      ...createModeSlice(set, get, api),
      ...createBlockSlice(set, get, api),
      ...createCameraOptionSlice(set, get, api),
      ...createCameraSlice(set, get, api),
      ...createMinimapSlice(set, get, api),
      ...createSizesSlice(set, get, api),
      ...createAnimationSlice(set, get, api),
      ...createMotionSlice(set, get, api),
      ...createInteractionSlice(set, get, api),
      ...createGameStatesSlice(set, get, api),
      ...createRideableSlice(set, get, api),
      ...createActiveStateSlice(set, get, api),
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

export const useGaesupContext = () => {
  const store = useGaesupStore();
  return {
    activeState: store.activeState,
    mode: store.mode,
    animationState: store.animationState,
    states: store.states,
    urls: store.urls,
    rideable: store.rideable,
    block: store.block,
    cameraOption: store.cameraOption,
    minimap: store.minimap,
  };
};
