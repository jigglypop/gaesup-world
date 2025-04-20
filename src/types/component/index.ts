import * as THREE from 'three';
import { ReactNode } from 'react';
import { GroupProps, RootState } from '@react-three/fiber';
import { CollisionEnterPayload, RigidBodyProps, RigidBodyTypeString } from '@react-three/rapier';
import { RefObject, Collider } from '@dimforge/rapier3d-compat';
import { RapierRigidBody } from '@react-three/rapier';
import { ComponentTypeString, RefsType, UrlsType } from '../base';
import { ControllerOptionsType, GaesupControllerType } from '../controller';
import { GroundRayType } from '../ray';
import { GaesupWorldContextType } from '../world';
import { DispatchType } from '../base';

/**
 * 파츠 타입
 */
export type PartType = {
  url?: string;
  color?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
};

/**
 * 파츠 모음 타입
 */
export type PartsType = PartType[];

/**
 * passive 컴포넌트 속성 타입
 */
export type PassivePropsType = {
  children?: ReactNode;
  groundRay?: GroundRayType;
  url: string;
  ridingUrl?: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  offset?: THREE.Vector3;
  controllerOptions?: ControllerOptionsType;
  currentAnimation?: string;
  rigidbodyType?: RigidBodyTypeString;
  sensor?: boolean;
  onIntersectionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  componentType: ComponentTypeString;
  intangible: boolean;
  rigidBodyProps?: RigidBodyProps;
  outerGroupProps?: THREE.Group;
  innerGroupProps?: THREE.Group;
  parts?: PartsType;
  isNotColliding?: boolean;
  isRiderOn?: boolean;
  enableRiding?: boolean;
};

/**
 * 계산 타입
 */
export type CalcType = {
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
  colliderRef: RefObject<Collider>;
  groundRay: GroundRayType;
  state?: RootState;
  delta?: number;
  worldContext: Partial<GaesupWorldContextType>;
  controllerContext: GaesupControllerType;
  dispatch?: DispatchType<GaesupWorldContextType>;
  matchSizes?: {
    [key in keyof UrlsType]?: THREE.Vector3;
  };
  // 재사용 가능한 임시 벡터 객체들 (성능 최적화용)
  tempVectors?: {
    impulse?: THREE.Vector3;
    velocity?: THREE.Vector3;
    [key: string]: THREE.Vector3;
  };
};

/**
 * 카메라 속성 타입
 */
export type CameraPropType = {
  state?: RootState;
  worldContext: Partial<GaesupWorldContextType>;
  controllerContext: GaesupControllerType;
  controllerOptions: ControllerOptionsType;
};

/**
 * 컨트롤러 타입
 */
export type ControllerType = {
  children?: ReactNode;
  groupProps?: GroupProps;
  rigidBodyProps?: RigidBodyProps;
  debug?: boolean;
  airplane?: Partial<{ [key: string]: any }>;
  vehicle?: Partial<{ [key: string]: any }>;
  character?: Partial<{ [key: string]: any }>;
  controllerOptions?: ControllerOptionsType;
  parts?: PartsType;
  onReady?: (prop: any) => void;
  onFrame?: (prop: any) => void;
  onDestory?: (prop: any) => void;
  onAnimate?: (prop: any) => void;
};
