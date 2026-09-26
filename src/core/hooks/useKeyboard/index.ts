import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useGaesupStore } from '@stores/gaesupStore';

import { createKeyboardOwnership } from './ownership';
import { useBuildingStore } from '../../building/stores/buildingStore';
import type { CameraOptionType } from '../../camera/core/types';
import { createDefaultInputActions, DEFAULT_INPUT_ACTIONS } from '../../input/actions/defaults';
import { useWorldInputScope } from '../../input/useWorldInputScope';
import type { KeyboardState } from '../../interactions/bridge';
import { useInputBackend } from '../../interactions/hooks';
import { logger } from '../../utils/logger';

type KeyboardKey = keyof KeyboardState;
const MOVE_KEYS: Record<string, KeyboardKey> = { 'y:1': 'forward', 'y:-1': 'backward', 'x:1': 'rightward', 'x:-1': 'leftward' };
const BUTTON_KEYS: Record<string, KeyboardKey> = {
  [DEFAULT_INPUT_ACTIONS.jump]: 'space', [DEFAULT_INPUT_ACTIONS.run]: 'shift', [DEFAULT_INPUT_ACTIONS.interact]: 'keyE',
};

/** Keyboard codes come from the default input actions, the one binding table (arrows, both Shifts); the rest are controller shortcuts. */
function createKeyMapping(): Record<string, KeyboardKey> {
  const mapping: Record<string, KeyboardKey> = { KeyZ: 'keyZ', KeyR: 'keyR', KeyF: 'keyF', Escape: 'escape' };
  for (const action of createDefaultInputActions()) {
    for (const binding of action.bindings) {
      if (binding.device !== 'keyboard') continue;
      const key = action.name === DEFAULT_INPUT_ACTIONS.move
        ? MOVE_KEYS[`${binding.axis}:${Math.sign(binding.scale ?? 1)}`]
        : BUTTON_KEYS[action.name];
      if (key) mapping[binding.code] = key;
    }
  }
  return mapping;
}

const KEY_MAPPING = createKeyMapping();

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
