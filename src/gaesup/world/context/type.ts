import { GroupProps } from '@react-three/fiber';
import * as THREE from 'three';
import { callbackType } from '../../controller/initialize/callback/type';
import { rideableType } from '../../hooks/useRideable/type';

import {
  ActionsType,
  ActiveStateType,
  AnimationAtomType,
  AnimationStatePropType,
  AnimationStateType,
  BlockType,
  CameraOptionDebugType,
  CameraOptionType,
  ClickerOptionType,
  ClickerType,
  ControlState,
  DispatchType,
  GameStatesType,
  KeyboardControlState,
  ModeType,
  PassiveStateType,
  PortalType,
  PortalsType,
  QueueActionType,
  QueueFunctionType,
  QueueItemType,
  QueueType,
  RefsType,
  ResourceUrlsType,
  SizeType,
  SizesType,
  WheelStateType,
  WheelsStateType,
  actionsType,
} from '../../types';

export type animationPropType = {
  current: string;
  animationNames: actionsType;
  keyControl: {
    [key: string]: boolean;
  };
  store: {};
  default: string;
};

export type airplaneDebugType = {
  angleDelta?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  buoyancy?: number;
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  linearDamping?: number;
};

export type vehicleDebugType = {
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  wheelOffset?: number;
  linearDamping?: number;
};

export type characterDebugType = {
  jumpSpeed?: number;
  turnSpeed?: number;
  walkSpeed?: number;
  runSpeed?: number;
  linearDamping?: number;
  jumpGravityScale?: number;
  normalGravityScale?: number;
  airDamping?: number;
  stopDamping?: number;
};

export interface airplaneType extends GroupProps, airplaneDebugType {}
export interface vehicleType extends GroupProps, vehicleDebugType {}
export interface characterType extends GroupProps, characterDebugType {}

export type {
  ActionsType,
  ActiveStateType,
  AnimationAtomType,
  AnimationStatePropType,
  AnimationStateType,
  BlockType,
  CameraOptionDebugType,
  CameraOptionType,
  ClickerOptionType,
  ClickerType,
  ControlState,
  GameStatesType,
  KeyboardControlState,
  ModeType,
  PassiveStateType,
  PortalType,
  PortalsType,
  QueueActionType,
  QueueFunctionType,
  QueueItemType,
  QueueType,
  RefsType,
  ResourceUrlsType,
  SizeType,
  SizesType,
  WheelStateType,
  WheelsStateType,
};

export type gaesupWorldContextType = {
  activeState: ActiveStateType;
  mode: ModeType;
  urls: ResourceUrlsType;
  states: GameStatesType;
  control: KeyboardControlState<string>;
  refs?: RefsType;
  animationState: AnimationStateType;
  clickerOption: ClickerOptionType;
  clicker: ClickerType;
  rideable: { [key: string]: rideableType };
  sizes: SizesType;
  block: BlockType;
  airplane: airplaneType;
  vehicle: vehicleType;
  character: characterType;
  callbacks: callbackType;
  controllerOptions: {
    lerp: {
      cameraTurn: number;
      cameraPosition: number;
    };
  };
};

export type gaesupDisptachType = DispatchType<gaesupWorldContextType>;
