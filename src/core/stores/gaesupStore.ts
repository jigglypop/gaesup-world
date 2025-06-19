import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { UrlsSlice, createUrlsSlice } from './slices/urls';
import { ModeSlice, createModeSlice } from './slices/mode';
import { ClickerOptionSlice, createClickerOptionSlice } from './slices/clickerOption';
import { BlockSlice, createBlockSlice } from './slices/block';
import { CameraOptionSlice, createCameraOptionSlice } from './slices/cameraOption';
import { CameraSlice, createCameraSlice } from './slices/camera';
import { MinimapSlice, createMinimapSlice } from './slices/minimap';
import { InputSlice, createInputSlice } from './slices/input';
import { SizesSlice, createSizesSlice } from './slices/sizes';
import { AnimationSlice, createAnimationSlice } from './slices/animation';
import { GameStatesSlice, createGameStatesSlice } from './slices/gameStates';
import { RideableSlice, createRideableSlice } from './slices/rideable';
import { ActiveStateSlice, createActiveStateSlice } from './slices/activeState';
import { ModeState, GameStatesType } from '../types';
import { UrlsState } from './slices/urls/types';

export type StoreState = UrlsSlice &
  ModeSlice &
  ClickerOptionSlice &
  BlockSlice &
  CameraOptionSlice &
  CameraSlice &
  MinimapSlice &
  InputSlice &
  SizesSlice &
  AnimationSlice &
  GameStatesSlice &
  RideableSlice &
  ActiveStateSlice;

type GaesupAction =
  | { type: 'setMode'; payload: Partial<ModeState> }
  | { type: 'setUrls'; payload: Partial<UrlsState> }
  | { type: 'setStates'; payload: Partial<GameStatesType> }
  | { type: 'update'; payload: Partial<StoreState> };

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
      initialize: (config: { mode?: any; urls?: any; cameraOption?: any }) => {
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
      case 'update': {
        const { updateState } = store as StoreState & {
          updateState: (updates: Partial<StoreState>) => void;
        };
        updateState(action.payload);
        break;
      }
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
