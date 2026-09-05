import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useGaesupStore } from '@stores/gaesupStore';

import { createKeyboardOwnership } from './ownership';
import { useBuildingStore } from '../../building/stores/buildingStore';
import type { CameraOptionType } from '../../camera/core/types';
import type { KeyboardState } from '../../interactions/bridge';
import { useInputBackend } from '../../interactions/hooks';
import { logger } from '../../utils/logger';

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
  enabled = true,
  listenToKeyboard = true,
) => {
  void enableDiagonal;
  void cameraOption;
  const isAutomationRunning = useGaesupStore((state) => state.automation?.queue.isRunning);
  const stopAutomation = useGaesupStore((state) => state.stopAutomation);
  const isInteractionActive = useGaesupStore((state) => state.interaction?.isActive ?? true);
  const isInBuildingEditMode = useBuildingStore((state) => state.isInEditMode());
  const inputBackend = useInputBackend();
  const ownership = useMemo(() => createKeyboardOwnership(inputBackend), [inputBackend]);
  
  const pressedKeys = useRef<Set<string>>(new Set());

  const keyMapping = useMemo(() => ({ ...KEY_MAPPING }), []);

  const pushKey = useCallback(
    (key: string, value: boolean): boolean => {
      if (!enabled || !isInteractionActive) return false;

      try {
        ownership.set(key, key, value);
        if (value) {
          pressedKeys.current.add(key);
        } else {
          pressedKeys.current.delete(key);
        }
        return true;
      } catch (error) {
        logger.error('Error updating keyboard state', error instanceof Error ? error : String(error));
        return false;
      }
    },
    [enabled, ownership, isInteractionActive],
  );

  const clearAllKeys = useCallback(() => {
    pressedKeys.current.clear();
    ownership.release();
    const cleared: Partial<KeyboardState> = {};
    for (const key of Object.values(KEY_MAPPING)) {
      if (!ownership.isHeld(key)) Object.assign(cleared, { [key]: false });
    }
    inputBackend.updateKeyboard(cleared);
  }, [inputBackend, ownership]);

  useEffect(() => {
    const keys = pressedKeys.current;
    return () => {
      ownership.release();
      keys.clear();
    };
  }, [ownership]);

  useEffect(() => {
    if (!isInteractionActive || isInBuildingEditMode) {
      clearAllKeys();
    }
  }, [clearAllKeys, isInteractionActive, isInBuildingEditMode]);

  useEffect(() => {
    if (listenToKeyboard) return;
    for (const code of Object.keys(KEY_MAPPING)) {
      if (!pressedKeys.current.delete(code)) continue;
      ownership.set(code, KEY_MAPPING[code]!, false);
    }
  }, [listenToKeyboard, ownership]);

  useEffect(() => {
    if (!enabled) {
      if (pressedKeys.current.size > 0) clearAllKeys();
      return;
    }
    const handleKey = (event: KeyboardEvent, isDown: boolean) => {
      const target = event.target;
      if (target instanceof HTMLElement && (
        target.matches('input, textarea, select') || target.isContentEditable
      )) {
        if (pressedKeys.current.size > 0) clearAllKeys();
        return;
      }
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
        ownership.set(event.code, mappedKey, true);
      } else if (!isDown && wasPressed) {
        pressedKeys.current.delete(event.code);
        ownership.set(event.code, mappedKey, false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => handleKey(e, true);
    const handleKeyUp = (e: KeyboardEvent) => handleKey(e, false);
    const handleVisibilityChange = () => document.hidden && clearAllKeys();

    if (listenToKeyboard) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }
    window.addEventListener('blur', clearAllKeys);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearAllKeys);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    enabled,
    listenToKeyboard,
    ownership,
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
