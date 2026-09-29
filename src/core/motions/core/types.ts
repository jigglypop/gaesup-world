import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import type { RefObject, RuntimeValue } from '@core/boilerplate';
import type { StoreState } from '@stores/types';

import type { PhysicsDispatchAction, PhysicsInputState } from '../types';
import type { PhysicsConfigType } from './config';

export type characterConfigType = Pick<PhysicsConfigType, 
  'walkSpeed' | 'runSpeed' | 'jumpSpeed' | 'jumpGravityScale' | 'normalGravityScale' | 'airDamping' | 'stopDamping'
>;

export type vehicleConfigType = Pick<PhysicsConfigType,
  'maxSpeed' | 'accelRatio' | 'brakeRatio' | 'linearDamping'
>;

export type airplaneConfigType = Pick<PhysicsConfigType,
  'gravityScale' | 'angleDelta' | 'maxAngle' | 'maxSpeed' | 'accelRatio'
>;

export type ActiveStateType = {
  euler: THREE.Euler;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  isGround: boolean;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  dir: THREE.Vector3;
  angular: THREE.Vector3;
};

export type ActiveState = ActiveStateType;

export type PhysicsCalcPropsLegacy = {
  rigidBodyRef: RefObject<RapierRigidBody>;
  innerGroupRef?: RefObject<THREE.Group>;
  outerGroupRef?: RefObject<THREE.Group>;
  inputRef?: RefObject<PhysicsInputState>;
  matchSizes?: THREE.Vector3;
  worldContext?: StoreState;
  onStateUpdate?: (updates: Partial<ActiveStateType>) => void;
};

export type BaseState<T = RuntimeValue> = {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  data: T;
};

export type PhysicsBridgeData = {
  update: (delta: number) => void;
  state: BaseState<PhysicsLayerStatus>;
};

export type PhysicsLayerProps = {
  children: RuntimeValue | RuntimeValue[];
  bridgeRef: RefObject<PhysicsBridgeData>;
};

export type PhysicsLayerStatus = {
  contextConnected: boolean;
  bridgeReady: boolean;
  frameReady: boolean;
  isPaused: boolean;
};

export type PhysicsStateLegacy = {
  rigidBody: RapierRigidBody;
  outerGroup: THREE.Group;
  innerGroup: THREE.Group;
  input: {
    forward: boolean;
    backward: boolean;
    leftward: boolean;
    rightward: boolean;
  };
} & PhysicsConfigType

export type PhysicsConnector = (state: StoreState) => (delta: number) => void;
export type PhysicsConnectors = Record<string, PhysicsConnector>;

export interface PhysicsStatus extends BaseState<PhysicsLayerStatus> {
  rawData: {
    inputSystem: PhysicsInputState;
    urls: StoreState['urls'];
    block: StoreState['rideable'];
    worldContext: Partial<StoreState>;
    controllerContext: Partial<ActiveStateType> | null;
    worldDispatch: (action: PhysicsDispatchAction) => void;
  };
}

export interface PhysicsResult extends PhysicsStatus {
  bridgeRef: RefObject<PhysicsBridgeData>;
}
