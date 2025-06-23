import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { createUrlsSlice } from './slices/urls';
import { createModeSlice } from './slices/mode';
import { createClickerOptionSlice } from '@stores/slices';
import { createBlockSlice } from './slices/block';
import { createCameraOptionSlice } from '../camera/stores/slices/cameraOption';
import { createCameraSlice } from '../camera/stores/slices/camera';
import { createMinimapSlice } from '@stores/slices';
import { createInputSlice } from '@stores/slices/input';
import { createSizesSlice } from './slices/sizes';
import { createAnimationSlice } from '../animation/stores/slices';
import { createGameStatesSlice } from '@stores/slices';
import { createRideableSlice } from '@stores/slices';
import { createActiveStateSlice } from '@stores/slices';
import { StoreState } from './types';

export const useGaesupStore = create<StoreState>()(
  devtools(
    subscribeWithSelector((set, get, api) => ({
      ...createUrlsSlice(set, get, api),
      ...createModeSlice(set, get, api),
      ...createClickerOptionSlice(set, get, api),
      ...createBlockSlice(set, get, api),
      ...createCameraOptionSlice(set, get, api),
      ...createCameraSlice(set, get, api),
      ...createMinimapSlice(set, get, api),
      ...createInputSlice(set, get, api),
      ...createSizesSlice(set, get, api),
      ...createAnimationSlice(set, get, api),
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
    clickerOption: store.clickerOption,
    input: store.input,
    rideable: store.rideable,
    block: store.block,
    cameraOption: store.cameraOption,
    minimap: store.minimap,
  };
};
