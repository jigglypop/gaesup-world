import { UrlsSlice } from './slices/urls';
import { ModeSlice, ModeState } from './slices/mode';
import { BlockSlice } from './slices/block';
import { CameraOptionSlice } from '../camera/stores/slices/cameraOption';
import { CameraSlice } from '../camera/stores/slices/camera';
import { MinimapSlice } from '@stores/slices';
import { SizesSlice } from './slices/sizes';
import { AnimationSlice } from '@stores/slices';
import { MotionSliceState, MotionActions } from '../motions/stores/types';
import { InteractionSliceState, InteractionActions } from '../interactions/stores/types';
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
  BlockSlice &
  CameraOptionSlice &
  CameraSlice &
  MinimapSlice &
  SizesSlice &
  AnimationSlice &
  MotionSliceState &
  MotionActions &
  InteractionSliceState &
  InteractionActions &
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
