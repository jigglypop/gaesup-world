import { Collider } from '@dimforge/rapier3d-compat';
import { RootState } from '@react-three/fiber';
import { RapierRigidBody } from '@react-three/rapier';
import { RefObject } from 'react';
import * as THREE from 'three';
import { PhysicsInputRef } from '../hooks/usePhysicsInput';
import {
  ActiveStateType,
  ClickerOptionType,
  GameStatesType,
  GroundRayType,
  ResourceUrlsType,
} from '../types';
import { dispatchType } from '../utils/type';
import {
  airplaneType,
  characterType,
  gaesupWorldContextType,
  vehicleType,
} from '../world/context/type';

export interface PhysicsRefs {
  colliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
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
  characterConfig: characterType;
  vehicleConfig: vehicleType;
  airplaneConfig: airplaneType;
  clickerOption: ClickerOptionType;
  modeType: 'character' | 'vehicle' | 'airplane';
}

export interface PhysicsCalcProps extends PhysicsRefs {
  groundRay: GroundRayType;
  state: RootState;
  delta: number;
  worldContext: Partial<gaesupWorldContextType>;
  dispatch: dispatchType<gaesupWorldContextType>;
  matchSizes: { [key in keyof ResourceUrlsType]?: THREE.Vector3 };
  inputRef: PhysicsInputRef;
  setKeyboardInput: (update: Partial<PhysicsState['keyboard']>) => void;
  setMouseInput: (update: Partial<PhysicsState['mouse']>) => void;
}

export interface PhysicsCalculationProps extends PhysicsRefs {
  groundRay: GroundRayType;
}
