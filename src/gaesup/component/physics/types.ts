import { ReactNode } from 'react';
import * as THREE from 'three';
import {
  DispatchType,
  ResourceUrlsType,
  ModeType,
  CameraOptionType,
  ClickerOptionState,
  ActionsType,
  AnimationTagType,
  CameraRayType,
  ControllerOptionsType,
  ControllerOtherPropType,
  GroundRayType,
  JumpConstType,
  JumpInnerType,
  JumpPropType,
  OptionsType,
  PartType,
  PartialOptionsType,
  PartsType,
  RayType,
  RefsType,
  SlopeRayType,
} from '../../types';
import { gaesupWorldContextType } from '../../atoms/types';
import { airplaneType, characterType, vehicleType } from '../../atoms';

export type gaesupWorldInitType = {
  value: gaesupWorldContextType;
  dispatch: DispatchType<gaesupWorldContextType>;
};

export type PerformanceMonitorConfig = {
  enabled?: boolean;
  mode?: 0 | 1 | 2;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  zIndex?: number;
  opacity?: number;
};

export type gaesupWorldPropsType = {
  children: ReactNode;
  startPosition?: THREE.Vector3;
  urls?: ResourceUrlsType;
  mode?: ModeType;
  debug?: boolean;
  cameraOption?: CameraOptionType;
  block?: any;
  clickerOption?: ClickerOptionState;
  performance?: PerformanceMonitorConfig;
};

export type callbackType = {
  onReady?: () => void;
  onFrame?: () => void;
  onDestory?: () => void;
  onAnimate?: () => void;
};

export type componentTypeString = 'character' | 'vehicle' | 'airplane' | 'passive';

export type controllerInnerType = {
  name?: string;
  groundRay: GroundRayType;
  cameraRay: CameraRayType;
  controllerOptions: ControllerOptionsType;
  parts?: PartsType;
} & ControllerOtherPropType &
  RefsType &
  callbackType;

export type gaesupControllerContextPropType = {
  airplane: airplaneType;
  vehicle: vehicleType;
  character: characterType;
  controllerOptions: ControllerOptionsType;
};

export type controllerType = ControllerOtherPropType &
  ResourceUrlsType &
  Partial<gaesupControllerContextPropType> &
  callbackType & {
    controllerOptions?: ControllerOptionsType;
    parts?: PartsType;
  };

export type {
  ActionsType,
  AnimationTagType,
  CameraRayType,
  ControllerOptionsType,
  ControllerOtherPropType,
  GroundRayType,
  JumpConstType,
  JumpInnerType,
  JumpPropType,
  OptionsType,
  PartType,
  PartialOptionsType,
  PartsType,
  RayType,
  RefsType,
  ResourceUrlsType,
  SlopeRayType,
};
