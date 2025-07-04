import * as THREE from 'three';
import { ActiveStateType } from './core/types';
import { GameStatesType } from '../world/components/Rideable/types';
import { GroupProps, RootState } from '@react-three/fiber';
import { ModeType, StoreState } from '../stores/types';
import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { SizesType } from '../stores/slices/sizes';

export type automationType = {
  isActive: boolean;
  queue: {
    actions: Array<{
      id: string;
      type: 'move' | 'click' | 'wait' | 'key' | 'custom';
      target?: THREE.Vector3;
      key?: string;
      duration?: number;
      delay?: number;
    }>;
    currentIndex: number;
    isRunning: boolean;
    isPaused: boolean;
    loop: boolean;
    maxRetries: number;
  };
  settings: {
    trackProgress: boolean;
    autoStart: boolean;
    loop: boolean;
    showVisualCues: boolean;
  };
};

export type airplaneConfigType = {
  angleDelta?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  buoyancy?: number;
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  linearDamping?: number;
  gravityScale?: number;
};

export type vehicleConfigType = {
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  wheelOffset?: number;
  linearDamping?: number;
};

export type characterConfigType = {
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

export interface airplaneType extends GroupProps, airplaneConfigType { }
export interface vehicleType extends GroupProps, vehicleConfigType { }
export interface characterType extends GroupProps, characterConfigType { }

export interface PhysicsCalcProps {
  rigidBodyRef: RefObject<RapierRigidBody>;
  innerGroupRef?: RefObject<THREE.Group>;
  state: RootState;
  delta: number;
  worldContext: StoreState;
  dispatch: (action: { type: string; payload?: unknown }) => void;
  matchSizes: SizesType;
  inputRef: { current: PhysicsCalculationProps };
  setKeyboardInput: (input: Partial<PhysicsCalculationProps['keyboard']>) => void;
  setMouseInput: (input: Partial<PhysicsCalculationProps['mouse']>) => void;
  body?: RapierRigidBody;
  memo?: {
    direction?: THREE.Vector3;
    directionTarget?: THREE.Vector3;
  };
}

export interface PhysicsCalculationProps {
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
  rigidBodyRef: RefObject<RapierRigidBody>;
  innerGroupRef?: RefObject<THREE.Group>;
}

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
  automationOption: automationType;
  modeType: ModeType;
  characterConfig: characterConfigType;
  vehicleConfig: vehicleConfigType;
  airplaneConfig: airplaneConfigType;
}
