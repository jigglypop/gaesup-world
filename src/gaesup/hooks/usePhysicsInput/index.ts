import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gaesupControllerType } from '../../controller/context/type';
import { BlockType, ResourceUrlsType } from '../../types';
import {
  gaesupWorldContextType,
  gaesupDisptachType as GaesupWorldDispatchType,
} from '../../world/context/type';

export interface PhysicsInputState {
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
}

export interface PhysicsBridgeInputData {
  inputSystem: {
    keyboard: PhysicsInputState['keyboard'];
    mouse: PhysicsInputState['mouse'];
  };
  urls: ResourceUrlsType;
  block: BlockType;
  worldContext: Partial<gaesupWorldContextType> | null;
  controllerContext: gaesupControllerType | null;
  dispatch: GaesupWorldDispatchType | null;
  setKeyboardInput?: (update: Partial<PhysicsInputState['keyboard']>) => void;
  setMouseInput?: (update: Partial<PhysicsInputState['mouse']>) => void;
  getSizesByUrls?: (urls: ResourceUrlsType) => Record<string, THREE.Vector3>;
}

export interface PhysicsBridgeData {
  input: PhysicsInputState;
  urls: ResourceUrlsType;
  blockControl: boolean;
  modeType: string;
  activeState: gaesupWorldContextType['activeState'];
  worldContext: Partial<gaesupWorldContextType> | null;
  controllerContext: gaesupControllerType | null;
  dispatch: GaesupWorldDispatchType | null;
  setKeyboardInput: (update: Partial<PhysicsInputState['keyboard']>) => void;
  setMouseInput: (update: Partial<PhysicsInputState['mouse']>) => void;
  getSizesByUrls: (urls: ResourceUrlsType) => Record<string, THREE.Vector3>;
}

export const usePhysicsInput = (injectedData: PhysicsBridgeInputData) => {
  const bridgeRef = useRef<PhysicsBridgeData>({
    input: {
      keyboard: {
        forward: false,
        backward: false,
        leftward: false,
        rightward: false,
        shift: false,
        space: false,
        keyZ: false,
        keyR: false,
        keyF: false,
        keyE: false,
        escape: false,
      },
      mouse: {
        target: new THREE.Vector3(0, 0, 0),
        angle: Math.PI / 2,
        isActive: false,
        shouldRun: false,
      },
    },
    urls: {
      characterUrl: '',
      vehicleUrl: '',
      airplaneUrl: '',
      wheelUrl: '',
      ridingUrl: '',
    },
    blockControl: false,
    modeType: 'character',
    activeState: {
      position: new THREE.Vector3(0, 5, 5),
      velocity: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      euler: new THREE.Euler(),
      direction: new THREE.Vector3(),
      dir: new THREE.Vector3(),
    },
    worldContext: null,
    controllerContext: null,
    dispatch: null,
    setKeyboardInput: () => {},
    setMouseInput: () => {},
    getSizesByUrls: () => ({}),
  });

  // 주입된 데이터를 ref에 동기화 (외부 의존성 없음)
  useEffect(() => {
    bridgeRef.current = {
      input: {
        keyboard: { ...injectedData.inputSystem.keyboard },
        mouse: {
          ...injectedData.inputSystem.mouse,
          target: injectedData.inputSystem.mouse.target.clone(),
        },
      },
      urls: injectedData.urls,
      blockControl: injectedData.block.control,
      modeType: injectedData.worldContext?.mode?.type || 'character',
      activeState: injectedData.worldContext?.activeState || bridgeRef.current.activeState,
      worldContext: injectedData.worldContext,
      controllerContext: injectedData.controllerContext,
      dispatch: injectedData.dispatch,
      setKeyboardInput: injectedData.setKeyboardInput || (() => {}),
      setMouseInput: injectedData.setMouseInput || (() => {}),
      getSizesByUrls: injectedData.getSizesByUrls || (() => ({})),
    };
  }, [injectedData]);

  // 하위 호환성을 위한 inputRef (기존 코드 호환)
  const inputRef = useRef<PhysicsInputState>({
    keyboard: {
      forward: false,
      backward: false,
      leftward: false,
      rightward: false,
      shift: false,
      space: false,
      keyZ: false,
      keyR: false,
      keyF: false,
      keyE: false,
      escape: false,
    },
    mouse: {
      target: new THREE.Vector3(0, 0, 0),
      angle: Math.PI / 2,
      isActive: false,
      shouldRun: false,
    },
  });

  // inputRef 동기화 (하위 호환성)
  useEffect(() => {
    inputRef.current = bridgeRef.current.input;
  }, [injectedData.inputSystem]);

  // 개발 모드에서 디버깅을 위한 함수들
  const getInputSnapshot = useCallback(
    () => ({
      keyboard: { ...bridgeRef.current.input.keyboard },
      mouse: { ...bridgeRef.current.input.mouse },
      timestamp: Date.now(),
    }),
    [],
  );

  const isKeyboardActive = useCallback(() => {
    const kb = bridgeRef.current.input.keyboard;
    return kb.forward || kb.backward || kb.leftward || kb.rightward;
  }, []);

  const isMouseActive = useCallback(() => {
    return bridgeRef.current.input.mouse.isActive;
  }, []);

  const getMovementDirection = useCallback(() => {
    const kb = bridgeRef.current.input.keyboard;
    const dirX = Number(kb.leftward) - Number(kb.rightward);
    const dirZ = Number(kb.forward) - Number(kb.backward);
    return { x: dirX, z: dirZ };
  }, []);

  return {
    // 새로운 통합 bridge ref (모든 데이터 포함)
    bridgeRef,

    // 하위 호환성을 위한 기존 inputRef
    inputRef,

    // 유틸리티 함수들
    getInputSnapshot,
    isKeyboardActive,
    isMouseActive,
    getMovementDirection,
  };
};

// Physics 계산에서 사용할 타입 export
export type PhysicsInputRef = ReturnType<typeof usePhysicsInput>['inputRef'];
export type PhysicsBridgeRef = ReturnType<typeof usePhysicsInput>['bridgeRef'];
