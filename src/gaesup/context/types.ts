import { GroupProps } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ActionsType,
  ActiveStateType,
  AnimationStateType,
  BlockState,
  ClickerOptionState,
  ClickerType,
  DispatchType,
  GameStatesType,
  KeyboardControlState,
  ModeType,
  RefsType,
  ResourceUrlsType,
  SizesType,
} from '../../types';
import { callbackType } from '../controller/initialize/callback/type';
import { rideableType } from '../hooks/useRideable/types';

export type animationPropType = {
  current: string;
  animationNames: ActionsType;
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

export type gaesupWorldContextType = {
  activeState: ActiveStateType;
  mode: ModeType;
  urls: ResourceUrlsType;
  states: GameStatesType;
  control: KeyboardControlState<string>;
  refs?: RefsType;
  animationState: AnimationStateType;
  clickerOption: ClickerOptionState;
  clicker: ClickerType;
  rideable: { [key: string]: rideableType };
  sizes: SizesType;
  block: BlockState;
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
