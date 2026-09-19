import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useGaesupStore } from '@stores/gaesupStore';

import { createKeyboardOwnership } from './ownership';
import { useBuildingStore } from '../../building/stores/buildingStore';
import type { CameraOptionType } from '../../camera/core/types';
import { useWorldInputScope } from '../../input/useWorldInputScope';
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
  const inputScope = useWorldInputScope();
  void enableDiagonal;
  void cameraOption;
  const isAutomationRunning = useGaesupStore((state) => state.automation?.queue.isRunning);
  const stopAutomation = useGaesupStore((state) => state.stopAutomation);
  const isInteractionActive = useGaesupStore((state) => state.interaction?.isActive ?? true);
  const isInBuildingEditMode = useBuildingStore((state) => state.isInEditMode());
  const inputBackend = useInputBackend();
  const ownership = useMemo(() => createKeyboardOwnership(inputBackend), [inputBackend]);
  
  const pressedKeys = useRef<Map<string, string>>(new Map());

  const keyMapping = useMemo(() => ({ ...KEY_MAPPING }), []);

  const pushKey = useCallback(
    (key: string, value: boolean): boolean => {
      if (!enabled || !isInteractionActive || !inputScope.isEnabled()) return false;

      try {
        const source = `api:${key}`;
        ownership.set(source, key, value);
        if (value) {
          pressedKeys.current.set(source, key);
        } else {
          pressedKeys.current.delete(source);
        }
        return true;
      } catch (error) {
        logger.error('Error updating keyboard state', error instanceof Error ? error : String(error));
        return false;
      }
    },
    [enabled, ownership, isInteractionActive, inputScope],
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
    for (const [source, code] of pressedKeys.current) {
      if (!KEY_MAPPING[code]) continue;
      pressedKeys.current.delete(source);
      ownership.set(source, KEY_MAPPING[code]!, false);
    }
  }, [listenToKeyboard, ownership]);

  useEffect(() => {
    if (!enabled) {
      if (pressedKeys.current.size > 0) clearAllKeys();
      return;
    }
    const handleKey = (event: KeyboardEvent, isDown: boolean) => {
      if (isDown && (event.ctrlKey || event.altKey || event.metaKey)) {
        if (pressedKeys.current.size > 0) clearAllKeys();
        return;
      }
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

      const source = inputScope.eventSource(event);
      const wasPressed = pressedKeys.current.has(source);

      if (isDown && !wasPressed) {
        pressedKeys.current.set(source, event.code);
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
        ownership.set(source, mappedKey, true);
      } else if (!isDown && wasPressed) {
        pressedKeys.current.delete(source);
        ownership.set(source, mappedKey, false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => handleKey(e, true);
    const handleKeyUp = (e: KeyboardEvent) => handleKey(e, false);
    const offDown = listenToKeyboard ? inputScope.listen('keydown', handleKeyDown) : undefined;
    const offUp = listenToKeyboard ? inputScope.listen('keyup', handleKeyUp) : undefined;
    const offBlur = inputScope.onBlur(() => { if (pressedKeys.current.size > 0) clearAllKeys(); });

    return () => {
      offDown?.(); offUp?.(); offBlur();
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
    inputScope,
  ]);

  return {
    pressedKeys: [...new Set(pressedKeys.current.values())],
    pushKey,
    isKeyPressed: (key: string) => Array.from(pressedKeys.current.values()).includes(key),
    clearAllKeys,
  };
};
