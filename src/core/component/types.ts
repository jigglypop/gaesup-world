import { ObjectMap } from '@react-three/fiber';
import { RapierRigidBody } from '@react-three/rapier';
import { MutableRefObject, ReactNode, Ref, RefObject, SetStateAction } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import {
  DispatchType,
  ResourceUrlsType,
  ModeType,
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
} from '../types';
import { gaesupWorldContextType, airplaneType, characterType, vehicleType } from '../types/core';
export type { CameraOptionType } from '../types';

export type GLTFResult = GLTF & {
  nodes: { [name: string]: THREE.Mesh | THREE.SkinnedMesh };
  materials: { [name: string]: THREE.Material | THREE.MeshStandardMaterial };
} & ObjectMap;

export type passiveRefsType = {
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
};

export type refsType = {
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
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

export type GaesupComponentProps = {
  props: controllerInnerType;
  refs: refsType;
};

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
