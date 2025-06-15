import { gaesupDisptachType, gaesupWorldContextType } from '../../types/core';
import { StoreState } from '../../stores/gaesupStore';
import { PhysicsBridgeData } from '../../../types';
import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

export interface StoreBridgeData {
  dispatch: gaesupDisptachType;
  get: () => StoreState;
  set: (
    partial:
      | StoreState
      | Partial<StoreState>
      | ((state: StoreState) => StoreState | Partial<StoreState>),
    replace?: boolean | undefined,
  ) => void;
  worldContext: Partial<gaesupWorldContextType>;
  setKeyboard: StoreState['setKeyboard'];
  setPointer: StoreState['setPointer'];
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

export interface PhysicsStatusResult {
  isReady: boolean;
  error: string | null;
  layerStatus: PhysicsLayerStatus;
  rawData: {
    inputSystem: any;
    urls: any;
    block: any;
    worldContext: any;
    controllerContext: any;
    worldDispatch: any;
  };
}

export interface PhysicsResult extends PhysicsStatusResult {
  bridgeRef: React.RefObject<PhysicsBridgeData>;
}

export type PhysicsConnectorType = {
  (state: StoreState): (delta: number) => void;
};

export type PhysicsConnectors = {
  [key: string]: PhysicsConnectorType;
};

export type getPhysicsState = {
  rigidBody: RapierRigidBody;
  outerGroup: THREE.Group;
  innerGroup: THREE.Group;
  input: {
    forward: boolean;
    backward: boolean;
    leftward: boolean;
    rightward: boolean;
  };
};
