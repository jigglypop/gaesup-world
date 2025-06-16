import * as THREE from 'three';
import { BaseAnimationState, BaseCallbacks, BaseController, BaseRefs } from '../types/common';
import { ControllerPropsConfig, ResourceUrls } from '../utils/types';
import { gaesupWorldContextType } from '../types/core';
import {
  AnimationSlice,
  BlockSlice,
  CameraOptionSlice,
  CameraSlice,
  ClickerOptionSlice,
  InputSlice,
  MinimapSlice,
  ModeSlice,
  SizesSlice,
  UrlsSlice,
} from './slices';

export type GaesupWorldMode = 'character' | 'vehicle' | 'airplane';

export interface GaesupWorldState {
  mode: GaesupWorldMode;
  subType?: string;
  urls: ResourceUrls;
  states: GameStates;
  control: BaseController['input'];
  refs: BaseRefs;
  animationState: Record<GaesupWorldMode, BaseAnimationState>;
  clicker: ClickerState;
  rideable: Record<string, THREE.Object3D>;
  sizes: Record<string, THREE.Vector3>;
  block: BlockState;
  config: ControllerPropsConfig;
  callbacks: BaseCallbacks;
}

export interface GameStates {
  rideableId: string;
  isMoving: boolean;
  isNotMoving: boolean;
  isOnTheGround: boolean;
  isOnMoving: boolean;
  isRotated: boolean;
  isRunning: boolean;
  isJumping: boolean;
  enableRiding: boolean;
  isRiderOn: boolean;
  isLanding: boolean;
  isFalling: boolean;
  isRiding: boolean;
  canRide: boolean;
  nearbyRideable: THREE.Object3D | null;
  shouldEnterRideable: boolean;
  shouldExitRideable: boolean;
}

export interface ClickerState {
  point: THREE.Vector3;
  angle: number;
  isOn: boolean;
  isRun: boolean;
}

export interface BlockState {
  camera: boolean;
  control: boolean;
  animation: boolean;
  scroll: boolean;
}

export type StoreState = gaesupWorldContextType &
  UrlsSlice &
  ModeSlice &
  ClickerOptionSlice &
  BlockSlice &
  CameraOptionSlice &
  CameraSlice &
  MinimapSlice &
  InputSlice &
  SizesSlice &
  AnimationSlice & {
    updateState: (updates: Partial<StoreState>) => void;
    resetState: () => void;
    initializeState: (initialState: Partial<StoreState>) => void;
    setRefs: (refs: Partial<gaesupWorldContextType['refs']>) => void;
    setStates: (states: Partial<gaesupWorldContextType['states']>) => void;
  };
