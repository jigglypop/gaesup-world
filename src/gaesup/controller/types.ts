import { airplaneType, characterType, vehicleType } from '../atoms';
import {
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
} from '../types';
import { callbackType } from './initialize/callback/types';

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
