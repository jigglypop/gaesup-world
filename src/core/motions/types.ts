import * as THREE from 'three';
import {
  ActiveStateType,
  GameStatesType,
} from '../types';
import { GroupProps } from '@react-three/fiber';
import { ModeType } from '../stores/types';

export type clickerOptionType = {
  autoStart: boolean;
  track: boolean;
  queue: (THREE.Vector3)[];
  loop: boolean;
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
  vehicleConfig: vehicleConfigType;
  airplaneConfig: airplaneConfigType;
  clickerOption: clickerOptionType;
  modeType: ModeType;
}
