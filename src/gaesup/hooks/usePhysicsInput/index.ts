import { RefObject, useRef } from 'react';
import * as THREE from 'three';
import type {
  KeyboardInputState,
  MouseInputState,
  ResourceUrlsType,
  BlockState,
  ActiveStateType,
  DispatchType,
  SizesType,
  PhysicsInputRef,
  PhysicsBridgeInputData,
  PhysicsBridgeData,
  PhysicsBridgeOutput
} from '../../../types';

export function usePhysicsInput(injectedData: PhysicsBridgeInputData): PhysicsBridgeOutput {
  const bridgeRef = useRef<PhysicsBridgeData>({
    worldContext: null,
    activeState: {
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      euler: new THREE.Euler(),
      direction: new THREE.Vector3(),
      dir: new THREE.Vector3(),
    },
    input: null,
    urls: {},
    blockControl: false,
    dispatch: () => {},
    setKeyboardInput: () => {},
    setMouseInput: () => {},
    getSizesByUrls: () => ({}),
  });

  if (injectedData.worldContext && injectedData.inputSystem) {
    bridgeRef.current = {
      worldContext: injectedData.worldContext,
      activeState: (injectedData.worldContext as any).activeState || bridgeRef.current.activeState,
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
