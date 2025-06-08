import { useAtomValue, useSetAtom } from 'jotai';
import { useContext, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { blockAtom, urlsAtom } from '../atoms';
import { animationAtoms } from '../atoms/animationAtoms';
import { inputAtom, keyboardInputAtom, pointerInputAtom } from '../atoms/inputAtom';
import { GaesupContext, GaesupDispatchContext } from '../atoms';
import { gaesupWorldContextType } from '../atoms/types';
import type { PhysicsBridgeInputData, PhysicsBridgeData } from '../../types';
import { useGaesupGltf } from '../utils/gltf';

export interface PhysicsResult {
  bridgeRef: React.RefObject<PhysicsBridgeData>;
  isReady: boolean;
  error: string | null;
  layerStatus: {
    atomsConnected: boolean;
    contextConnected: boolean;
    bridgeReady: boolean;
    animationSynced: boolean;
  };
  rawData: {
    inputSystem: any;
    urls: any;
    block: any;
    worldContext: any;
    controllerContext: any;
    worldDispatch: any;
  };
}

export function usePhysics(): PhysicsResult {
  const inputSystem = useAtomValue(inputAtom);
  const setKeyboardInput = useSetAtom(keyboardInputAtom);
  const setPointerInput = useSetAtom(pointerInputAtom);
  const urls = useAtomValue(urlsAtom);
  const block = useAtomValue(blockAtom);
  const setCharacterAnimation = useSetAtom(animationAtoms.character);
  const setVehicleAnimation = useSetAtom(animationAtoms.vehicle);
  const setAirplaneAnimation = useSetAtom(animationAtoms.airplane);
  const worldContext = useContext(GaesupContext);
  const worldDispatch = useContext(GaesupDispatchContext);

  // Utils
  const { getSizesByUrls } = useGaesupGltf();

  // Bridge ref
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

  // Refs for change detection
  const lastInputSystemRef = useRef(inputSystem);
  const lastUrlsRef = useRef(urls);
  const lastBlockRef = useRef(block);
  const lastWorldContextRef = useRef(worldContext);
  const lastWorldDispatchRef = useRef(worldDispatch);

  // Animation state sync
  useEffect(() => {
    if (!worldContext?.animationState) return;

    const { animationState } = worldContext;

    if (animationState['character']) {
      setCharacterAnimation({
        current: animationState['character'].current,
        default: animationState['character'].default,
        store: animationState['character'].store || {},
      });
    }

    if (animationState['vehicle']) {
      setVehicleAnimation({
        current: animationState['vehicle'].current,
        default: animationState['vehicle'].default,
        store: animationState['vehicle'].store || {},
      });
    }

    if (animationState['airplane']) {
      setAirplaneAnimation({
        current: animationState['airplane'].current,
        default: animationState['airplane'].default,
        store: animationState['airplane'].store || {},
      });
    }
  }, [
    worldContext?.animationState,
    setCharacterAnimation,
    setVehicleAnimation,
    setAirplaneAnimation,
  ]);

  // Bridge data preparation with change detection
  const bridgeInputData = useMemo(() => {
    const hasChanged =
      lastInputSystemRef.current !== inputSystem ||
      lastUrlsRef.current !== urls ||
      lastBlockRef.current !== block ||
      lastWorldContextRef.current !== worldContext ||
      lastWorldDispatchRef.current !== worldDispatch;

    if (!hasChanged) {
      return null; // No change, skip update
    }

    // Update refs
    lastInputSystemRef.current = inputSystem;
    lastUrlsRef.current = urls;
    lastBlockRef.current = block;
    lastWorldContextRef.current = worldContext;
    lastWorldDispatchRef.current = worldDispatch;

    return {
      inputSystem: {
        keyboard: inputSystem.keyboard,
        mouse: inputSystem.pointer,
      },
      urls,
      block,
      worldContext,
      controllerContext: worldContext,
      dispatch: worldDispatch,
      setKeyboardInput: (update: any) => setKeyboardInput(update),
      setMouseInput: (update: any) => setPointerInput(update),
      getSizesByUrls,
    } as PhysicsBridgeInputData;
  }, [
    inputSystem,
    urls,
    block,
    worldContext,
    worldDispatch,
    setKeyboardInput,
    setPointerInput,
    getSizesByUrls,
  ]);

  // Update bridge ref when data changes
  useEffect(() => {
    if (!bridgeInputData || !bridgeInputData.worldContext || !bridgeInputData.inputSystem) {
      return;
    }

    bridgeRef.current = {
      worldContext: bridgeInputData.worldContext,
      activeState:
        (bridgeInputData.worldContext as Partial<gaesupWorldContextType>).activeState ||
        bridgeRef.current.activeState,
      input: {
        keyboard: bridgeInputData.inputSystem.keyboard,
        mouse: bridgeInputData.inputSystem.mouse,
      },
      urls: bridgeInputData.urls,
      blockControl: bridgeInputData.block?.control || false,
      dispatch: bridgeInputData.dispatch,
      setKeyboardInput: bridgeInputData.setKeyboardInput,
      setMouseInput: bridgeInputData.setMouseInput,
      getSizesByUrls: bridgeInputData.getSizesByUrls,
    };
  }, [bridgeInputData]);

  // Status calculations
  const layerStatus = {
    atomsConnected: !!(inputSystem && urls && block),
    contextConnected: !!worldContext,
    bridgeReady: !!bridgeRef.current.worldContext,
    animationSynced: !!worldContext?.animationState,
  };

  const isReady =
    layerStatus.atomsConnected && layerStatus.contextConnected && layerStatus.bridgeReady;

  return {
    bridgeRef,
    isReady,
    error: null,
    layerStatus,
    rawData: {
      inputSystem,
      urls,
      block,
      worldContext,
      controllerContext: worldContext,
      worldDispatch,
    },
  };
}
