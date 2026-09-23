import type { RefObject } from 'react';

import type { RootState } from '@react-three/fiber';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import type { AutomationState, InteractionState } from '@core/interactions/bridge/types';

import type { PhysicsQueryAdapter } from './core/physics/types';
import type { ActiveStateType } from './core/types';
import type { GroundRay, PhysicsEntityProps } from './entities';
import type { ModeType, StoreState } from '../stores/types';
import type { GameStatesType } from '../world/components/Rideable/types';




export type PhysicsInputState = Pick<InteractionState, 'keyboard' | 'mouse'>;
export type PhysicsDispatchPayload = object | string | number | boolean | null | undefined;
export type PhysicsDispatchAction = {
  type: string;
  payload?: PhysicsDispatchPayload;
};


export interface PhysicsCalcProps {
  rigidBodyRef: RefObject<RapierRigidBody>;
  innerGroupRef?: RefObject<THREE.Group>;
  state: RootState;
  delta: number;
  worldContext: StoreState;
  dispatch: (action: PhysicsDispatchAction) => void;
  inputRef: { current: PhysicsInputState };
  setKeyboardInput: (input: Partial<PhysicsInputState['keyboard']>) => void;
  setMouseInput: (input: Partial<PhysicsInputState['mouse']>) => void;
  body?: RapierRigidBody;
  colliderSize?: PhysicsEntityProps['colliderSize'];
  physicsQueries?: PhysicsQueryAdapter;
  groundRay?: GroundRay;
  memo?: {
    direction?: THREE.Vector3;
    directionTarget?: THREE.Vector3;
  };
}

export type PhysicsCalculationProps =
  Required<Pick<PhysicsEntityProps, 'rigidBodyRef'>> &
  Pick<PhysicsEntityProps, 'innerGroupRef' | 'outerGroupRef' | 'colliderRef' | 'groundRay' | 'colliderSize'>;

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
    isLookAround?: boolean;
  };
  automationOption: AutomationState;
  modeType: ModeType;
  delta?: number;
}
