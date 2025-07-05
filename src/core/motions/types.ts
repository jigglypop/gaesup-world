import * as THREE from 'three';
import { ActiveStateType, characterConfigType, vehicleConfigType, airplaneConfigType } from './core/types';
import { GameStatesType } from '../world/components/Rideable/types';
import { RootState } from '@react-three/fiber';
import { ModeType, StoreState } from '../stores/types';
import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { SizesType } from '../stores/slices/sizes';
import { PhysicsEntityProps } from './entities';

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

export type PhysicsCalculationProps = Pick<PhysicsEntityProps,
  'innerGroupRef' | 'outerGroupRef' | 'colliderRef' | 'groundRay' | 'rigidBodyRef'>;

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
  delta?: number;
}
