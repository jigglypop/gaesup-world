import { Collider } from '@dimforge/rapier3d-compat';
import { RootState } from '@react-three/fiber';
import { RapierRigidBody } from '@react-three/rapier';
import { RefObject } from 'react';
import * as THREE from 'three';
import {
  ActiveStateType,
  ClickerOptionType,
  GameStatesType,
  GroundRayType,
  ResourceUrlsType,
  CameraOptionType,
} from '../types';
import { DispatchType } from '../types';
import { airplaneType, characterType, gaesupWorldContextType, vehicleType } from '../types/core';

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
  dispatch: DispatchType<gaesupWorldContextType>;
  matchSizes: { [key in keyof ResourceUrlsType]?: THREE.Vector3 };
  inputRef: PhysicsInputRef;
  setKeyboardInput: (update: Partial<PhysicsState['keyboard']>) => void;
  setMouseInput: (update: Partial<PhysicsState['mouse']>) => void;
}

export interface PhysicsCalculationProps extends PhysicsRefs {
  groundRay: GroundRayType;
}

export const commonPhysics = {
  applyDamping: (
    rigidBodyRef: RefObject<RapierRigidBody>,
    config: { linearDamping: number; condition?: boolean; brakeRatio?: number },
  ) => {
    if (!rigidBodyRef.current) return;
    const damping = config.condition ? config.brakeRatio || 5 : config.linearDamping;
    rigidBodyRef.current.setLinearDamping(damping);
  },

  applyImpulse: (
    rigidBodyRef: RefObject<RapierRigidBody>,
    direction: THREE.Vector3,
    config: { maxSpeed: number; boost?: number },
  ) => {
    if (!rigidBodyRef.current) return;
    const velocity = rigidBodyRef.current.linvel();
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);

    if (speed < config.maxSpeed) {
      const mass = rigidBodyRef.current.mass();
      const boost = config.boost || 1;
      rigidBodyRef.current.applyImpulse(
        {
          x: direction.x * mass * boost,
          y: direction.y * mass * boost,
          z: direction.z * mass * boost,
        },
        false,
      );
    }
  },
};

export type CameraPropType = {
  state: RootState & { delta: number };
  worldContext: gaesupWorldContextType;
  cameraOption: CameraOptionType;
};
