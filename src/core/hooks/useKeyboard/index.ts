import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useGaesupStore } from '@stores/gaesupStore';

import { useBuildingStore } from '../../building/stores/buildingStore';
import type { CameraOptionType } from '../../camera/core/types';
import type { KeyboardState } from '../../interactions/bridge';
import { useInputBackend } from '../../interactions/hooks';

const KEY_MAPPING: Record<string, string> = {
  KeyW: 'forward',
  KeyA: 'leftward',
  KeyS: 'backward',
  KeyD: 'rightward',
  ShiftLeft: 'shift',
  Space: 'space',
  KeyZ: 'keyZ',
  KeyR: 'keyR',
  KeyF: 'keyF',
  KeyE: 'keyE',
  Escape: 'escape',
};

export const useKeyboard = (
  enableDiagonal = true,
  enableClicker = true,
  cameraOption?: CameraOptionType,
) => {
  void enableDiagonal;
  void cameraOption;
  const isAutomationRunning = useGaesupStore((state) => state.automation?.queue.isRunning);
  const stopAutomation = useGaesupStore((state) => state.stopAutomation);
  const isInteractionActive = useGaesupStore((state) => state.interaction?.isActive ?? true);
  const isInBuildingEditMode = useBuildingStore((state) => state.isInEditMode());
  const inputBackend = useInputBackend();
  
  const pressedKeys = useRef<Set<string>>(new Set());

  const keyMapping = useMemo(() => ({ ...KEY_MAPPING }), []);

  const pushKey = useCallback(
    (key: string, value: boolean): boolean => {
      if (!isInteractionActive) return false;

      try {
        inputBackend.updateKeyboard({ [key]: value } as Partial<KeyboardState>);
        if (value) {
          pressedKeys.current.add(key);
        } else {
          pressedKeys.current.delete(key);
        }
        return true;
      } catch (error) {
        console.error('Error updating keyboard state:', error);
        return false;
      }
    },
    [inputBackend, isInteractionActive],
  );

  const clearAllKeys = useCallback(() => {
    pressedKeys.current.clear();
    inputBackend.updateKeyboard({
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
      escape: false
    });
  }, [inputBackend]);

  useEffect(() => {
    if (!isInteractionActive || isInBuildingEditMode) {
      clearAllKeys();
    }
  }, [clearAllKeys, isInteractionActive, isInBuildingEditMode]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent, isDown: boolean) => {
      const mappedKey = keyMapping[event.code];
      if (!mappedKey) return;

      if (!isInteractionActive || isInBuildingEditMode) {
        if (isDown) event.preventDefault();
        clearAllKeys();
        return;
      }

      const wasPressed = pressedKeys.current.has(event.code);

      if (isDown && !wasPressed) {
        pressedKeys.current.add(event.code);
        if (event.code === 'Space') event.preventDefault();

        if (
          enableClicker &&
          isAutomationRunning &&
          (
            mappedKey === 'forward' ||
            mappedKey === 'backward' ||
            mappedKey === 'leftward' ||
            mappedKey === 'rightward'
          )
        ) {
          stopAutomation();
          inputBackend.updateMouse({ isActive: false, shouldRun: false });
        }
        inputBackend.updateKeyboard({ [mappedKey]: true } as Partial<KeyboardState>);
      } else if (!isDown && wasPressed) {
        pressedKeys.current.delete(event.code);
        inputBackend.updateKeyboard({ [mappedKey]: false } as Partial<KeyboardState>);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => handleKey(e, true);
    const handleKeyUp = (e: KeyboardEvent) => handleKey(e, false);
    const handleVisibilityChange = () => document.hidden && clearAllKeys();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    keyMapping,
    enableClicker,
    stopAutomation,
    isAutomationRunning,
    clearAllKeys,
    isInteractionActive,
    isInBuildingEditMode,
    inputBackend,
  ]);

  return {
    pressedKeys: Array.from(pressedKeys.current),
    pushKey,
    isKeyPressed: (key: string) => pressedKeys.current.has(key),
    clearAllKeys,
  };
};
