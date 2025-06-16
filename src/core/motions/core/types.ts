import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import { BaseCallbacks, BaseRefs, BaseState } from '../../../types/common';
import { GaesupWorldState, StoreState } from '../../../stores/types';

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
    worldContext: Partial<GaesupWorldState>;
    controllerContext: unknown;
    worldDispatch: (action: { type: string; payload?: unknown }) => void;
  };
}

export interface PhysicsResult extends PhysicsStatus {
  bridgeRef: React.RefObject<PhysicsBridgeData>;
}
