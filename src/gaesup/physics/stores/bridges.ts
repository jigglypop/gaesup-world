import { useAtomValue, useSetAtom } from 'jotai';
import { useContext, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { inputAtom, keyboardInputAtom, pointerInputAtom, blockAtom, urlsAtom } from '../../atoms';
import { animationAtoms } from '../../atoms/animationAtoms';
import { GaesupContext, GaesupDispatchContext } from '../../atoms';
import { gaesupWorldContextType } from '../../atoms/types';
import type { PhysicsBridgeData, PhysicsBridgeInputData } from '../../../types';
import { useGaesupGltf } from '../../utils/gltf';
import {
  AtomBridgeData,
  ContextBridgeData,
  PhysicsLayerStatus,
  PhysicsResult,
  PhysicsStatusResult,
} from './types';

function useAtomBridge(): AtomBridgeData {
  const inputSystem = useAtomValue(inputAtom);
  const setKeyboardInput = useSetAtom(keyboardInputAtom);
  const setPointerInput = useSetAtom(pointerInputAtom);
  const urls = useAtomValue(urlsAtom);
  const block = useAtomValue(blockAtom);

  return {
    inputSystem,
    urls,
    block,
    setKeyboardInput,
    setPointerInput,
  };
}

function useContextBridge(): ContextBridgeData {
  const worldContext = useContext(GaesupContext);
  const worldDispatch = useContext(GaesupDispatchContext);

  return {
    worldContext,
    worldDispatch,
  };
}

function useAnimationSync(worldContext: gaesupWorldContextType | null) {
  const setCharacterAnimation = useSetAtom(animationAtoms.character);
  const setVehicleAnimation = useSetAtom(animationAtoms.vehicle);
  const setAirplaneAnimation = useSetAtom(animationAtoms.airplane);

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
}

function useChangeDetection(
  atomData: AtomBridgeData,
  contextData: ContextBridgeData,
): PhysicsBridgeInputData | null {
  const lastInputSystemRef = useRef(atomData.inputSystem);
  const lastUrlsRef = useRef(atomData.urls);
  const lastBlockRef = useRef(atomData.block);
  const lastWorldContextRef = useRef(contextData.worldContext);
  const lastWorldDispatchRef = useRef(contextData.worldDispatch);

  return useMemo(() => {
    const hasChanged =
      lastInputSystemRef.current !== atomData.inputSystem ||
      lastUrlsRef.current !== atomData.urls ||
      lastBlockRef.current !== atomData.block ||
      lastWorldContextRef.current !== contextData.worldContext ||
      lastWorldDispatchRef.current !== contextData.worldDispatch;

    if (!hasChanged) {
      return null;
    }

    lastInputSystemRef.current = atomData.inputSystem;
    lastUrlsRef.current = atomData.urls;
    lastBlockRef.current = atomData.block;
    lastWorldContextRef.current = contextData.worldContext;
    lastWorldDispatchRef.current = contextData.worldDispatch;

    return {
      inputSystem: {
        keyboard: atomData.inputSystem.keyboard,
        mouse: atomData.inputSystem.pointer,
      },
      urls: atomData.urls,
      block: atomData.block,
      worldContext: contextData.worldContext,
      controllerContext: contextData.worldContext,
      dispatch: contextData.worldDispatch,
      setKeyboardInput: (update: any) => atomData.setKeyboardInput(update),
      setMouseInput: (update: any) => atomData.setPointerInput(update),
      getSizesByUrls: () => ({}),
    } as PhysicsBridgeInputData;
  }, [atomData, contextData]);
}

function useBridgeData(bridgeInputData: PhysicsBridgeInputData | null): {
  bridgeRef: React.RefObject<PhysicsBridgeData>;
} {
  const { getSizesByUrls } = useGaesupGltf();

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
      getSizesByUrls,
    };
  }, [bridgeInputData, getSizesByUrls]);

  return { bridgeRef };
}

function usePhysicsStatus(
  atomData: AtomBridgeData,
  contextData: ContextBridgeData,
  bridgeRef: React.RefObject<PhysicsBridgeData>,
): PhysicsStatusResult {
  const layerStatus: PhysicsLayerStatus = {
    atomsConnected: !!(atomData.inputSystem && atomData.urls && atomData.block),
    contextConnected: !!contextData.worldContext,
    bridgeReady: !!bridgeRef.current.worldContext,
    animationSynced: !!contextData.worldContext?.animationState,
  };

  const isReady =
    layerStatus.atomsConnected && layerStatus.contextConnected && layerStatus.bridgeReady;

  return {
    isReady,
    error: null,
    layerStatus,
    rawData: {
      inputSystem: atomData.inputSystem,
      urls: atomData.urls,
      block: atomData.block,
      worldContext: contextData.worldContext,
      controllerContext: contextData.worldContext,
      worldDispatch: contextData.worldDispatch,
    },
  };
}

export function usePhysics(): PhysicsResult {
  const atomData = useAtomBridge();
  const contextData = useContextBridge();

  useAnimationSync(contextData.worldContext);

  const bridgeInputData = useChangeDetection(atomData, contextData);
  const { bridgeRef } = useBridgeData(bridgeInputData);
  const statusResult = usePhysicsStatus(atomData, contextData, bridgeRef);

  return {
    bridgeRef,
    ...statusResult,
  };
}
