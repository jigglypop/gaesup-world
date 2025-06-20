import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useGaesupStore } from '@stores/gaesupStore';
import { KEY_MAPPING } from '@constants/index';
import { KeyboardOptions, KeyboardResult } from './types';

const initialKeyState = {
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
  escape: false,
};

export function useKeyboard(options: KeyboardOptions = {}): KeyboardResult {
  const { preventDefault = true, enableClicker = true, customKeyMapping = {} } = options;
  const clickerOption = useGaesupStore((state) => state.clickerOption);
  const setClickerOption = useGaesupStore((state) => state.setClickerOption);
  const setKeyboard = useGaesupStore((state) => state.setKeyboard);
  const setPointer = useGaesupStore((state) => state.setPointer);
  const pressedKeys = useRef<Set<string>>(new Set());

  const keyMapping = useMemo(() => ({ ...KEY_MAPPING, ...customKeyMapping }), [customKeyMapping]);

  const pushKey = useCallback(
    (key: string, value: boolean): boolean => {
      try {
        setKeyboard({ [key]: value });
        value ? pressedKeys.current.add(key) : pressedKeys.current.delete(key);
        return true;
      } catch (error) {
        console.error('Push key failed:', error);
        return false;
      }
    },
    [setKeyboard],
  );

  const clearAllKeys = useCallback(() => {
    pressedKeys.current.clear();
    setKeyboard(initialKeyState);
  }, [setKeyboard]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent, isDown: boolean) => {
      const mappedKey = keyMapping[event.code as keyof typeof keyMapping];
      if (!mappedKey) return;

      const wasPressed = pressedKeys.current.has(event.code);

      if (isDown && !wasPressed) {
        pressedKeys.current.add(event.code);
        if (event.code === 'Space' && preventDefault) event.preventDefault();

        if (enableClicker && event.code === 'KeyS' && clickerOption.isRun) {
          setClickerOption({ isRun: false });
          setPointer({ isActive: false, shouldRun: false });
        }

        setKeyboard({ [mappedKey]: true });
      } else if (!isDown && wasPressed) {
        pressedKeys.current.delete(event.code);
        setKeyboard({ [mappedKey]: false });
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
    preventDefault,
    enableClicker,
    setKeyboard,
    setClickerOption,
    setPointer,
    clearAllKeys,
  ]);

  return {
    pressedKeys: Array.from(pressedKeys.current),
    pushKey,
    isKeyPressed: (key: string) => pressedKeys.current.has(key),
    clearAllKeys,
  };
}
