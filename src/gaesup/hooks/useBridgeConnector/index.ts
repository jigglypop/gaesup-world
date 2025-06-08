import { useSnapshot } from 'valtio';
import { useEffect, useMemo, useRef } from 'react';
import { gameStore } from '../../store/gameStore';
import { gameActions } from '../../store/actions';
import { PhysicsBridgeInputData } from '../../../types';
import { useGaesupGltf } from '../useGaesupGltf';
import { usePhysicsInput } from '../usePhysicsInput';
import { BridgeConnectorReturnType } from './types';

export const useBridgeConnector = (): BridgeConnectorReturnType => {
  const inputSystem = useSnapshot(gameStore.input);
  const urls = useSnapshot(gameStore.resources.urls);
  const block = useSnapshot(gameStore.input.blocks);
  const animationState = useSnapshot(gameStore.ui.animation);
  useEffect(() => {
    if (!animationState) return;

    if (animationState['character']) {
      gameActions.updateAnimation('character', {
        current: animationState['character'].current,
        default: animationState['character'].default,
        store: animationState['character'].store || {},
      });
    }

    if (animationState['vehicle']) {
      gameActions.updateAnimation('vehicle', {
        current: animationState['vehicle'].current,
        default: animationState['vehicle'].default,
        store: animationState['vehicle'].store || {},
      });
    }

    if (animationState['airplane']) {
      gameActions.updateAnimation('airplane', {
        current: animationState['airplane'].current,
        default: animationState['airplane'].default,
        store: animationState['airplane'].store || {},
      });
    }
  }, [animationState]);
  const { getSizesByUrls } = useGaesupGltf();
  const bridgeDataRef = useRef<PhysicsBridgeInputData | null>(null);
  const lastInputSystemRef = useRef(inputSystem);
  const lastUrlsRef = useRef(urls);
  const lastBlockRef = useRef(block);

  const bridgeInputData = useMemo(() => {
    const hasChanged =
      lastInputSystemRef.current !== inputSystem ||
      lastUrlsRef.current !== urls ||
      lastBlockRef.current !== block;

    if (!hasChanged && bridgeDataRef.current) {
      return bridgeDataRef.current;
    }

    lastInputSystemRef.current = inputSystem;
    lastUrlsRef.current = urls;
    lastBlockRef.current = block;

    const data: PhysicsBridgeInputData = {
      inputSystem: {
        keyboard: inputSystem.keyboard,
        mouse: inputSystem.pointer,
      },
      urls,
      block,
      worldContext: gameStore,
      controllerContext: gameStore,
      dispatch: () => {},
      setKeyboardInput: (update) => gameActions.updateKeyboard(update),
      setMouseInput: (update) => gameActions.updatePointer(update),
      getSizesByUrls,
    };
    bridgeDataRef.current = data;
    return data;
  }, [inputSystem, urls, block, getSizesByUrls]);

  const physicsResult = usePhysicsInput(bridgeInputData);
  return {
    ...physicsResult,
    rawData: {
      inputSystem,
      urls,
      block,
      worldContext: gameStore,
      controllerContext: gameStore,
      worldDispatch: () => {},
    },
    layerStatus: {
      atomsConnected: !!(inputSystem && urls && block),
      contextConnected: true,
      bridgeReady: !!physicsResult.bridgeRef.current,
      animationSynced: !!animationState,
    },
  };
};
