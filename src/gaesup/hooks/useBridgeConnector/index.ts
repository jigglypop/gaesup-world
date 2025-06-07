import { useAtomValue, useSetAtom } from 'jotai';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { blockAtom, urlsAtom } from '../../atoms';
import { animationAtoms } from '../../atoms/animationAtoms';
import { inputAtom, keyboardInputAtom, pointerInputAtom } from '../../atoms/inputAtom';
import { GaesupContext, GaesupDispatchContext } from '../../context';
import { PhysicsBridgeInputData } from '../../../types';
import { useGaesupGltf } from '../useGaesupGltf';
import { usePhysicsInput } from '../usePhysicsInput';
import { BridgeConnectorReturnType } from './types';

export const useBridgeConnector = (): BridgeConnectorReturnType => {
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
  const { getSizesByUrls } = useGaesupGltf();
  const bridgeDataRef = useRef<PhysicsBridgeInputData | null>(null);
  const lastInputSystemRef = useRef(inputSystem);
  const lastUrlsRef = useRef(urls);
  const lastBlockRef = useRef(block);
  const lastWorldContextRef = useRef(worldContext);
  const lastWorldDispatchRef = useRef(worldDispatch);
  const bridgeInputData = useMemo(() => {
    const hasChanged =
      lastInputSystemRef.current !== inputSystem ||
      lastUrlsRef.current !== urls ||
      lastBlockRef.current !== block ||
      lastWorldContextRef.current !== worldContext ||
      lastWorldDispatchRef.current !== worldDispatch;

    if (!hasChanged && bridgeDataRef.current) {
      return bridgeDataRef.current;
    }

    lastInputSystemRef.current = inputSystem;
    lastUrlsRef.current = urls;
    lastBlockRef.current = block;
    lastWorldContextRef.current = worldContext;
    lastWorldDispatchRef.current = worldDispatch;

    const data: PhysicsBridgeInputData = {
      inputSystem: {
        keyboard: inputSystem.keyboard,
        mouse: inputSystem.pointer,
      },
      urls,
      block,
      worldContext,
      controllerContext: worldContext,
      dispatch: worldDispatch,
      setKeyboardInput: (update) => setKeyboardInput(update),
      setMouseInput: (update) => setPointerInput(update),
      getSizesByUrls,
    };
    bridgeDataRef.current = data;
    return data;
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

  const physicsResult = usePhysicsInput(bridgeInputData);
  return {
    ...physicsResult,
    rawData: {
      inputSystem,
      urls,
      block,
      worldContext,
      controllerContext: worldContext,
      worldDispatch,
    },
    layerStatus: {
      atomsConnected: !!(inputSystem && urls && block),
      contextConnected: !!worldContext,
      bridgeReady: !!physicsResult.bridgeRef.current,
      animationSynced: !!worldContext?.animationState,
    },
  };
};
