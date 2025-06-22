import { UrlsSlice } from './slices/urls';
import { ModeSlice, ModeState } from './slices/mode';
import { ClickerOptionSlice } from '@stores/slices';
import { BlockSlice } from './slices/block';
import { CameraOptionSlice } from '../camera/stores/slices/cameraOption';
import { CameraSlice } from '../camera/stores/slices/camera';
import { MinimapSlice } from '@stores/slices';
import { InputSlice } from './slices/input';
import { SizesSlice } from './slices/sizes';
import { AnimationSlice } from '@stores/slices';
import { GameStatesSlice } from '@stores/slices';
import { RideableSlice } from '@stores/slices';
import { ActiveStateSlice } from '@stores/slices';
import { GameStatesType } from '@/core';
import { UrlsState } from '@stores/slices';

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
