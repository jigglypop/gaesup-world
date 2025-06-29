import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import {StoreState } from '../../stores/types';
import { RefObject } from "react"

export interface ActiveStateType {
  euler: THREE.Euler;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  isGround: boolean;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  dir: THREE.Vector3;
  angular: THREE.Vector3;
}

export interface ActiveState extends ActiveStateType {}

export interface PhysicsCalcProps {
  rigidBodyRef: RefObject<RapierRigidBody>;
  innerGroupRef?: RefObject<THREE.Group>;
  matchSizes?: THREE.Vector3;
  worldContext?: StoreState;
}

export interface BaseState<T = unknown> {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  data: T;
}

export interface PhysicsBridgeData {
  update: (delta: number) => void;
  state: BaseState<PhysicsLayerStatus>;
}

export interface PhysicsLayerProps {
  children: React.ReactNode;
  bridgeRef: React.RefObject<PhysicsBridgeData>;
}

export interface PhysicsLayerStatus {
  contextConnected: boolean;
  bridgeReady: boolean;
  frameReady: boolean;
  isPaused: boolean;
}

export interface PhysicsState {
  rigidBody: RapierRigidBody;
  outerGroup: THREE.Group;
  innerGroup: THREE.Group;
  input: {
    forward: boolean;
    backward: boolean;
    leftward: boolean;
    rightward: boolean;
  };
}

export type PhysicsConnector = (state: StoreState) => (delta: number) => void;
export type PhysicsConnectors = Record<string, PhysicsConnector>;

export interface PhysicsStatus extends BaseState<PhysicsLayerStatus> {
  rawData: {
    inputSystem: unknown;
    urls: unknown;
    block: unknown;
    worldContext: Partial<StoreState>;
    controllerContext: unknown;
    worldDispatch: (action: { type: string; payload?: unknown }) => void;
  };
}

export interface PhysicsResult extends PhysicsStatus {
  bridgeRef: React.RefObject<PhysicsBridgeData>;
}
