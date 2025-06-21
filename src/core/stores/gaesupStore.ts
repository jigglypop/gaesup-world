import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { createUrlsSlice } from './slices/urls';
import { createModeSlice } from './slices/mode';
import { createClickerOptionSlice } from './slices/clickerOption';
import { createBlockSlice } from './slices/block';
import { createCameraOptionSlice } from './slices/cameraOption';
import { createCameraSlice } from './slices/camera';
import { createMinimapSlice } from './slices/minimap';
import { createInputSlice } from './slices/input';
import { createSizesSlice } from './slices/sizes';
import { createAnimationSlice } from './slices/animation';
import { createGameStatesSlice } from './slices/gameStates';
import { createRideableSlice } from './slices/rideable';
import { createActiveStateSlice } from './slices/activeState';
import { StoreState, GaesupAction } from './types';

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

export const useGaesupDispatch = () => {
  const store = useGaesupStore();
  return (action: GaesupAction) => {
    switch (action.type) {
      case 'setMode':
        store.setMode(action.payload);
        break;
      case 'setUrls':
        store.setUrls(action.payload);
        break;
      case 'setStates':
        store.setStates(action.payload);
        break;
      case 'update':
        store.updateState(action.payload);
        break;
      default:
        break;
    }
  };
};

export const useGaesup = () => {
  const context = useGaesupContext();
  const dispatch = useGaesupDispatch();
  return { context, dispatch };
};
