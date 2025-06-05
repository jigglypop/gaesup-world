import { useAtomValue } from 'jotai';
import { RefObject, useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { GaesupWorldContextType } from '../../world/context/type';
import { activeStateAtom } from '../../atoms';

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
  worldContext: GaesupWorldContextType | null;
  controllerContext: GaesupWorldContextType | null;
  dispatch: any;
  setKeyboardInput: (update: any) => void;
  setMouseInput: (update: any) => void;
  getSizesByUrls: () => any;
}

export interface PhysicsBridgeData {
  worldContext: GaesupWorldContextType | null;
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
  getSizesByUrls: () => any;
}

export interface PhysicsBridgeOutput {
  bridgeRef: RefObject<PhysicsBridgeData>;
  isReady: boolean;
  error: string | null;
}

export function usePhysicsInput(injectedData: PhysicsBridgeInputData): PhysicsBridgeOutput {
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
    isReady: true,
    error: null,
  };
}
