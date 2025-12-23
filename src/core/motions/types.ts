import { RefObject } from 'react';

import { RootState } from '@react-three/fiber';
import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import type { AutomationState, InteractionState } from '@core/interactions/bridge/types';

import type { ActiveStateType } from './core/types';
import { PhysicsEntityProps } from './entities';
import { ModeType, StoreState } from '../stores/types';
import { GameStatesType } from '../world/components/Rideable/types';




export type PhysicsInputState = Pick<InteractionState, 'keyboard' | 'mouse'>;


export interface PhysicsCalcProps {
  rigidBodyRef: RefObject<RapierRigidBody>;
  innerGroupRef?: RefObject<THREE.Group>;
  state: RootState;
  delta: number;
  worldContext: StoreState;
  dispatch: (action: { type: string; payload?: unknown }) => void;
  inputRef: { current: PhysicsInputState };
  setKeyboardInput: (input: Partial<PhysicsInputState['keyboard']>) => void;
  setMouseInput: (input: Partial<PhysicsInputState['mouse']>) => void;
  body?: RapierRigidBody;
  memo?: {
    direction?: THREE.Vector3;
    directionTarget?: THREE.Vector3;
  };
}

export type PhysicsCalculationProps =
  Required<Pick<PhysicsEntityProps, 'rigidBodyRef'>> &
  Pick<PhysicsEntityProps, 'innerGroupRef' | 'outerGroupRef' | 'colliderRef' | 'groundRay'>;

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
  automationOption: AutomationState;
  modeType: ModeType;
  delta?: number;
}
