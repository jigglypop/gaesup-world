import { useRef } from 'react';
import * as THREE from 'three';
import { gaesupWorldContextType } from '../../world/context/type';

export interface PhysicsInputRef {
  current: {
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
  } | null;
}

export interface PhysicsBridgeInputData {
  inputSystem: {
    keyboard: any;
    mouse: any;
  };
  urls: any;
  block: any;
  worldContext: Partial<gaesupWorldContextType> | null;
  dispatch: any;
  setKeyboardInput: (update: any) => void;
  setMouseInput: (update: any) => void;
  getSizesByUrls: (urls: any) => any;
}

export interface PhysicsBridgeData {
  worldContext: Partial<gaesupWorldContextType> | null;
  activeState: any;
  input: {
    keyboard: any;
    mouse: any;
  } | null;
  urls: any;
  blockControl: boolean;
  dispatch: any;
  setKeyboardInput: (update: any) => void;
  setMouseInput: (update: any) => void;
  getSizesByUrls: (urls: any) => any;
}

export function usePhysicsInput(injectedData: PhysicsBridgeInputData) {
  const bridgeRef = useRef<PhysicsBridgeData>({
    worldContext: null,
    activeState: null,
    input: null,
    urls: null,
    blockControl: false,
    dispatch: null,
    setKeyboardInput: () => {},
    setMouseInput: () => {},
    getSizesByUrls: () => ({}),
  });

  if (injectedData.worldContext && injectedData.inputSystem) {
    bridgeRef.current = {
      worldContext: injectedData.worldContext,
      activeState: injectedData.worldContext.activeState,
      input: {
        keyboard: injectedData.inputSystem.keyboard,
        mouse: injectedData.inputSystem.mouse,
      },
      urls: injectedData.urls,
      blockControl: injectedData.block?.control || false,
      dispatch: injectedData.dispatch,
      setKeyboardInput: injectedData.setKeyboardInput,
      setMouseInput: injectedData.setMouseInput,
      getSizesByUrls: injectedData.getSizesByUrls,
    };
  }

  return {
    bridgeRef,
  };
}

// Physics 계산에서 사용할 타입 export
export type PhysicsInputRef = ReturnType<typeof usePhysicsInput>['inputRef'];
export type PhysicsBridgeRef = ReturnType<typeof usePhysicsInput>['bridgeRef'];
