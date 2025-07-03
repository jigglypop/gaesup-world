import { UrlsSlice } from './slices/urls';
import { ModeSlice, ModeState } from './slices/mode';
import { CameraOptionSlice } from '../camera/stores/slices/cameraOption';
import { CameraSlice } from '../camera/stores/slices/camera';
import { SizesSlice } from './slices/sizes';
import { AnimationSlice } from '../animation/stores/types';
import { MotionSliceState, MotionActions } from '../motions/stores/types';
import { InteractionSliceState, InteractionActions } from '../interactions/stores/types';
import { GameStatesSlice } from './slices/gameStates';
import { RideableSlice } from './slices/rideable';
import { ActiveStateSlice } from './slices/activeState';
import { GameStatesType } from '../world/components/Rideable/types';
import { UrlsState } from './slices/urls';
import { PerformanceState } from './slices/performance';
import { WorldSlice } from '../world/stores/slices/worldStates/types';

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
  CameraOptionSlice &
  CameraSlice &
  SizesSlice &
  Omit<AnimationSlice, 'getAnimation' | 'getCurrentAnimation'> &
  MotionSliceState &
  MotionActions &
  InteractionSliceState &
  InteractionActions &
  GameStatesSlice &
  RideableSlice &
  ActiveStateSlice &
  PerformanceState &
  WorldSlice & {
    updateState: (updates: Partial<StoreState>) => void;
    initialize: (config: Partial<StoreState>) => void;
  };

export type GaesupAction =
  | { type: 'setMode'; payload: Partial<ModeState> }
  | { type: 'setUrls'; payload: Partial<UrlsState> }
  | { type: 'setStates'; payload: Partial<GameStatesType> }
  | { type: 'update'; payload: Partial<StoreState> };
