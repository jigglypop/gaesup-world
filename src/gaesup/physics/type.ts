import { RootState } from '@react-three/fiber';

import { Collider } from '@dimforge/rapier3d-compat';
import { RapierRigidBody } from '@react-three/rapier';
import { RefObject } from 'react';
import * as THREE from 'three';
import {
  airplaneType,
  characterType,
  gaesupControllerType,
  vehicleType,
} from '../controller/context/type';
import { PhysicsInputRef } from '../hooks/usePhysicsInput';
import {
  ActiveStateType,
  CameraOptionType,
  ClickerOptionType,
  ControllerOptionsType,
  GameStatesType,
  GroundRayType,
  RefsType,
  ResourceUrlsType,
} from '../types';
import { dispatchType } from '../utils/type';
import { gaesupWorldContextType } from '../world/context/type';

export type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;

export type hidratePropType = {
  position: THREE.Vector3;
  euler: THREE.Euler;
} & Partial<RefsType>;

export type propInnerType = {
  colliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
};

export interface PhysicsState {
  activeState: ActiveStateType;
  gameStates: GameStatesType;
  keyboard: {
    forward: boolean;
    backward: boolean;
    leftward: boolean;
    rightward: boolean;
    shift: boolean;
    space: boolean;
    keyZ: boolean;
    keyR: boolean;
    keyF: boolean;
    keyE: boolean;
    escape: boolean;
  };
  mouse: {
    target: THREE.Vector3;
    angle: number;
    isActive: boolean;
    shouldRun: boolean;
  };
  characterConfig: characterType;
  vehicleConfig: vehicleType;
  airplaneConfig: airplaneType;
  clickerOption: ClickerOptionType;
  modeType: 'character' | 'vehicle' | 'airplane';
}

/**
 * 순수 함수용 Physics 계산 파라미터
 */
export type PhysicsCalc = propInnerType & {
  state: RootState;
  delta: number;
  groundRay: GroundRayType;
  physicsState: PhysicsState;
  matchSizes: {
    [key in keyof ResourceUrlsType]?: THREE.Vector3;
  };
  updateActiveState: (update: Partial<ActiveStateType>) => void;
  updateGameStates: (update: Partial<GameStatesType>) => void;
  updateKeyboard: (update: Partial<PhysicsState['keyboard']>) => void;
  updateMouse: (update: Partial<PhysicsState['mouse']>) => void;
};

export type calcPropType = propInnerType & {
  state?: RootState;
  matchSizes?: {
    [key in keyof ResourceUrlsType]?: THREE.Vector3;
  };
  delta?: number;
  dispatch?: dispatchType<gaesupWorldContextType>;
};

export type intersectObjectMapType = {
  [uuid: string]: THREE.Mesh;
};

export type cameraPropType = {
  state?: RootState;
  worldContext: Partial<gaesupWorldContextType>;
  controllerContext: gaesupControllerType;
  controllerOptions: ControllerOptionsType;
  cameraOption: CameraOptionType;
};

// 기존 calculation 타입 (점진적 마이그레이션용)
export type calcType = calcPropType & {
  groundRay: GroundRayType;
  worldContext?: Partial<gaesupWorldContextType>;
  controllerContext?: gaesupControllerType;
  inputRef?: PhysicsInputRef;
  setKeyboardInput?: (update: Partial<PhysicsState['keyboard']>) => void;
  setMouseInput?: (update: Partial<PhysicsState['mouse']>) => void;
};

export type PhysicsData = PhysicsState;
export type PurePhysicsCalcType = PhysicsCalc;

export type PhysicsCalculationProps = propInnerType & {
  groundRay: GroundRayType;
};
