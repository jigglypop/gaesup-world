import { useSnapshot } from 'valtio';
import { subscribeKey } from 'valtio/utils';
import { useEffect, useCallback } from 'react';
import { gameStore } from '../store/gameStore';
import { gameActions } from '../store/actions';

export function usePhysicsState() {
  return gameStore.physics;
}

export function useGameStates() {
  return useSnapshot(gameStore.gameStates);
}

export function useInputState() {
  return useSnapshot(gameStore.input);
}

export function useKeyboardInput() {
  const keyboard = useSnapshot(gameStore.input.keyboard);

  const updateKeyboard = useCallback((updates: Partial<typeof gameStore.input.keyboard>) => {
    gameActions.updateKeyboard(updates);
  }, []);

  return [keyboard, updateKeyboard] as const;
}

export function usePointerInput() {
  const pointer = useSnapshot(gameStore.input.pointer);

  const updatePointer = useCallback((updates: Partial<typeof gameStore.input.pointer>) => {
    gameActions.updatePointer(updates);
  }, []);

  return [pointer, updatePointer] as const;
}

export function useMovementState() {
  const { keyboard, pointer, clickerOption } = useSnapshot(gameStore.input);
  const gameStates = useSnapshot(gameStore.gameStates);

  const isKeyboardMoving =
    keyboard.forward || keyboard.backward || keyboard.leftward || keyboard.rightward;
  const isPointerMoving = pointer.isActive;

  return {
    isMoving: isKeyboardMoving || isPointerMoving,
    isRunning:
      (keyboard.shift && isKeyboardMoving) ||
      (pointer.shouldRun && isPointerMoving && clickerOption.isRun),
    isJumping: keyboard.space,
    inputSource: isKeyboardMoving ? 'keyboard' : isPointerMoving ? 'pointer' : 'none',
    isKeyboardMoving,
    isPointerMoving,
    isOnGround: gameStates.isOnTheGround,
    velocity: gameStore.physics.activeState.velocity,
  };
}

export function useModeState() {
  const mode = useSnapshot(gameStore.ui.mode);

  const changeMode = useCallback((type: 'character' | 'vehicle' | 'airplane') => {
    gameActions.changeMode(type);
  }, []);

  return [mode, changeMode] as const;
}

export function useAnimationState(type: 'character' | 'vehicle' | 'airplane') {
  return useSnapshot(gameStore.ui.animation[type]);
}

export function useCameraOption() {
  const cameraOption = useSnapshot(gameStore.ui.cameraOption);

  const updateCameraOption = useCallback((updates: Partial<typeof gameStore.ui.cameraOption>) => {
    gameActions.updateCameraOption(updates);
  }, []);

  return [cameraOption, updateCameraOption] as const;
}

export function useUrls() {
  const urls = useSnapshot(gameStore.resources.urls);

  const updateUrls = useCallback((updates: Partial<typeof gameStore.resources.urls>) => {
    gameActions.updateUrls(updates);
  }, []);

  return [urls, updateUrls] as const;
}

export function useSizes() {
  const sizes = useSnapshot(gameStore.resources.sizes);

  const updateSizes = useCallback((updates: Record<string, any>) => {
    gameActions.updateSizes(updates);
  }, []);

  return [sizes, updateSizes] as const;
}

export function useBlockState() {
  const blocks = useSnapshot(gameStore.input.blocks);

  const updateBlocks = useCallback((updates: Partial<typeof gameStore.input.blocks>) => {
    gameActions.updateBlocks(updates);
  }, []);

  return [blocks, updateBlocks] as const;
}

export function useClickerOption() {
  const clickerOption = useSnapshot(gameStore.input.clickerOption);

  const updateClickerOption = useCallback(
    (updates: Partial<typeof gameStore.input.clickerOption>) => {
      gameActions.updateClickerOption(updates);
    },
    [],
  );

  return [clickerOption, updateClickerOption] as const;
}

export function useCurrentController() {
  const mode = useSnapshot(gameStore.ui.mode);
  const config = useSnapshot(gameStore.config);

  switch (mode.type) {
    case 'airplane':
      return config.airplane;
    case 'vehicle':
      return config.vehicle;
    case 'character':
    default:
      return config.character;
  }
}

export function useGameStateSubscription(
  key: keyof typeof gameStore.gameStates,
  callback: (value: any) => void,
) {
  useEffect(() => {
    return subscribeKey(gameStore.gameStates, key, callback);
  }, [key, callback]);
}

export function useInputSubscription(
  type: 'keyboard' | 'pointer',
  key: string,
  callback: (value: any) => void,
) {
  useEffect(() => {
    if (type === 'keyboard') {
      return subscribeKey(gameStore.input.keyboard, key as any, callback);
    } else {
      return subscribeKey(gameStore.input.pointer, key as any, callback);
    }
  }, [type, key, callback]);
}
