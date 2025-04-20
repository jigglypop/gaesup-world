import * as THREE from 'three';
import { GroupProps } from '@react-three/fiber';
import { ComponentTypeString, KeyControlType, RefsType } from '../base';
import { CallbackType } from '../callback';

/**
 * 컨트롤러 옵션 타입
 */
export type ControllerOptionsType = {
  lerp: {
    cameraTurn: number;
    cameraPosition: number;
  };
};

/**
 * 모드 타입
 */
export type ModeType = {
  type?: ComponentTypeString;
  controller?: 'clicker' | string;
  control?: 'normal' | 'orbit';
  isButton?: boolean;
};

/**
 * 비행기 디버그 설정 타입
 */
export type AirplaneDebugType = {
  angleDelta?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  buoyancy?: number;
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  linearDamping?: number;
};

/**
 * 차량 디버그 설정 타입
 */
export type VehicleDebugType = {
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  wheelOffset?: number;
  linearDamping?: number;
};

/**
 * 캐릭터 디버그 설정 타입
 */
export type CharacterDebugType = {
  jumpSpeed?: number;
  turnSpeed?: number;
  walkSpeed?: number;
  runSpeed?: number;
  linearDamping?: number;
};

/**
 * 비행기 타입
 */
export interface AirplaneType extends GroupProps, AirplaneDebugType {}

/**
 * 차량 타입
 */
export interface VehicleType extends GroupProps, VehicleDebugType {}

/**
 * 캐릭터 타입
 */
export interface CharacterType extends GroupProps, CharacterDebugType {}

/**
 * 컨트롤러 컨텍스트 타입
 */
export type GaesupControllerType = {
  airplane: AirplaneType;
  vehicle: VehicleType;
  character: CharacterType;
  callbacks?: CallbackType;
  refs?: RefsType;
  controllerOptions?: ControllerOptionsType;
};
