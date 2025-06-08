import { useCallback } from 'react';
import {
  usePhysicsState,
  useGameStates,
  useKeyboardInput,
  usePointerInput,
  useModeState,
  useCameraOption,
  useUrls,
  useSizes,
  useBlockState,
  useClickerOption,
  useAnimationState,
  useCurrentController,
} from './useValtio';
import { gameActions } from '../store/actions';

export function useActiveStateAtom() {
  const physics = usePhysicsState();

  const setActiveState = useCallback(
    (update: any) => {
      if (typeof update === 'function') {
        const newState = update(physics.activeState);
        gameActions.updatePhysics(newState);
      } else {
        gameActions.updatePhysics(update);
      }
    },
    [physics],
  );

  return [physics.activeState, setActiveState] as const;
}

export function useGameStatesAtom() {
  const gameStates = useGameStates();

  const setGameStates = useCallback(
    (update: any) => {
      if (typeof update === 'function') {
        const newState = update(gameStates);
        gameActions.updateGameStates(newState);
      } else {
        gameActions.updateGameStates(update);
      }
    },
    [gameStates],
  );

  return [gameStates, setGameStates] as const;
}

export function useKeyboardInputAtom() {
  return useKeyboardInput();
}

export function usePointerInputAtom() {
  return usePointerInput();
}

export function useModeStateAtom() {
  return useModeState();
}

export function useAnimationStateAtom() {
  const mode = useModeState()[0];
  const animationState = useAnimationState(mode.type);

  const setAnimationState = useCallback(
    (type: 'character' | 'vehicle' | 'airplane', updates: any) => {
      gameActions.updateAnimation(type, updates);
    },
    [],
  );

  return [animationState, setAnimationState] as const;
}

export function useCameraOptionAtom() {
  return useCameraOption();
}

export function useUrlsStateAtom() {
  return useUrls();
}

export function useSizesStateAtom() {
  return useSizes();
}

export function useBlockStateAtom() {
  return useBlockState();
}

export function useClickerOptionAtom() {
  return useClickerOption();
}

export function useCurrentControllerConfigAtom() {
  return useCurrentController();
}

export const useAtomValue = (atomName: string) => {
  switch (atomName) {
    case 'activeStateAtom':
      return usePhysicsState().activeState;
    case 'gameStatesAtom':
      return useGameStates();
    case 'modeStateAtom':
      return useModeState()[0];
    case 'inputAtom':
      return {
        keyboard: useKeyboardInput()[0],
        pointer: usePointerInput()[0],
      };
    case 'urlsStateAtom':
      return useUrls()[0];
    case 'sizesStateAtom':
      return useSizes()[0];
    case 'blockAtom':
      return useBlockState()[0];
    case 'clickerOptionAtom':
      return useClickerOption()[0];
    case 'cameraOptionAtom':
      return useCameraOption()[0];
    default:
      console.warn(`Deprecated atom: ${atomName}`);
      return null;
  }
};

export const useSetAtom = (atomName: string) => {
  switch (atomName) {
    case 'activeStateAtom':
      return useActiveStateAtom()[1];
    case 'gameStatesAtom':
      return useGameStatesAtom()[1];
    case 'keyboardInputAtom':
      return useKeyboardInput()[1];
    case 'pointerInputAtom':
      return usePointerInput()[1];
    case 'modeStateAtom':
      return useModeState()[1];
    case 'urlsStateAtom':
      return useUrls()[1];
    case 'sizesStateAtom':
      return useSizes()[1];
    case 'blockAtom':
      return useBlockState()[1];
    case 'clickerOptionAtom':
      return useClickerOption()[1];
    case 'cameraOptionAtom':
      return useCameraOption()[1];
    default:
      console.warn(`Deprecated setter for atom: ${atomName}`);
      return () => {};
  }
};

export const useAtom = (atomName: string) => {
  const value = useAtomValue(atomName);
  const setter = useSetAtom(atomName);
  return [value, setter] as const;
};
