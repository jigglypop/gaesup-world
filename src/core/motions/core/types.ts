import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import { GaesupWorldState, StoreState } from '@stores/types';
import { useGaesupStore } from '@stores/gaesupStore';
import { useGaesupGltf } from '@utils/gltf';
import { BaseState } from '@/core/types/common';

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

export interface UsePhysicsReturn {
  worldContext: ReturnType<typeof useGaesupStore>;
  activeState: ReturnType<typeof useGaesupStore>['activeState'];
  input: {
    keyboard: ReturnType<typeof useGaesupStore>['input']?.keyboard;
    mouse: ReturnType<typeof useGaesupStore>['input']?.pointer;
  };
  urls: ReturnType<typeof useGaesupStore>['urls'];
  dispatch: (payload: Partial<StoreState>) => void;
  setKeyboardInput: ReturnType<typeof useGaesupStore>['setKeyboard'];
  setMouseInput: ReturnType<typeof useGaesupStore>['setPointer'];
  getSizesByUrls: ReturnType<typeof useGaesupGltf>['getSizesByUrls'];
  isReady: boolean;
  blockControl: ReturnType<typeof useGaesupStore>['block']?.control;
}