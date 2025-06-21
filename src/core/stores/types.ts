import { UrlsSlice } from './slices/urls';
import { ModeSlice, ModeState } from './slices/mode';
import { ClickerOptionSlice } from './slices/clickerOption';
import { BlockSlice } from './slices/block';
import { CameraOptionSlice } from './slices/cameraOption';
import { CameraSlice } from './slices/camera';
import { MinimapSlice } from './slices/minimap';
import { InputSlice } from './slices/input';
import { SizesSlice } from './slices/sizes';
import { AnimationSlice } from './slices/animation';
import { GameStatesSlice } from './slices/gameStates';
import { RideableSlice } from './slices/rideable';
import { ActiveStateSlice } from './slices/activeState';
import { GameStatesType } from '../types';
import { UrlsState } from './slices/urls/types';

export type ModeType = 'character' | 'vehicle' | 'airplane';
export type ControllerType = 'clicker' | 'keyboard' | 'joystick' | 'gamepad';
export type CameraType =
  | 'thirdPerson'
  | 'shoulder'
  | 'fixed'
  | 'isometric'
  | 'firstPerson'
  | 'topDown'
  | 'chase'
  | 'orbit'
  | 'free'
  | 'custom';

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
  ActiveStateSlice & {
    updateState: (updates: Partial<StoreState>) => void;
    initialize: (config: Partial<StoreState>) => void;
  };

export type GaesupAction =
  | { type: 'setMode'; payload: Partial<ModeState> }
  | { type: 'setUrls'; payload: Partial<UrlsState> }
  | { type: 'setStates'; payload: Partial<GameStatesType> }
  | { type: 'update'; payload: Partial<StoreState> };
