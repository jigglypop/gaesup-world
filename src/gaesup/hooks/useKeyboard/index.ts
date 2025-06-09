import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import { clickerAtom } from '../../atoms';
import { keyboardInputAtom, pointerInputAtom } from '../../atoms/inputAtom';
import { KEY_MAPPING } from '../../constants';
import { KeyboardOptions, KeyboardResult } from './types';

export function useKeyboard(options: KeyboardOptions = {}): KeyboardResult {
  const { preventDefault = true, enableClicker = true, customKeyMapping = {} } = options;
  const clicker = useAtomValue(clickerAtom);
  const setClicker = useSetAtom(clickerAtom);
  const setKeyboardInput = useSetAtom(keyboardInputAtom);
  const setPointerInput = useSetAtom(pointerInputAtom);
  const pressedKeys = useRef<Set<string>>(new Set());
  const keyMapping = { ...KEY_MAPPING, ...customKeyMapping };
  const pushKey = useCallback(
    (key: string, value: boolean): boolean => {
      try {
        setKeyboardInput({
          [key]: value,
        });
        if (value) {
          pressedKeys.current.add(key);
        } else {
          pressedKeys.current.delete(key);
        }
        return true;
      } catch (error) {
        console.error('Push key failed:', error);
        return false;
      }
    },
    [setKeyboardInput],
  );

  const isKeyPressed = useCallback((key: string): boolean => {
    return pressedKeys.current.has(key);
  }, []);

  const clearAllKeys = useCallback(() => {
    pressedKeys.current.clear();
    setKeyboardInput({
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
    });
  }, [setKeyboardInput]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const mappedKey = keyMapping[event.code as keyof typeof keyMapping];
      if (mappedKey && !pressedKeys.current.has(event.code)) {
        pressedKeys.current.add(event.code);
        if (event.code === 'Space' && preventDefault) {
          event.preventDefault();
        }
        if (enableClicker && event.code === 'KeyS' && clicker.isOn) {
          setClicker({
            ...clicker,
            isOn: false,
            isRun: false,
          });
          setPointerInput({
            isActive: false,
            shouldRun: false,
          });
        }

        setKeyboardInput({
          [mappedKey]: true,
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const mappedKey = keyMapping[event.code as keyof typeof keyMapping];
      if (mappedKey && pressedKeys.current.has(event.code)) {
        pressedKeys.current.delete(event.code);
        setKeyboardInput({
          [mappedKey]: false,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    clicker,
    setClicker,
    setKeyboardInput,
    setPointerInput,
    keyMapping,
    preventDefault,
    enableClicker,
  ]);

  // 창 포커스 변경 시 모든 키 해제
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearAllKeys();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [clearAllKeys]);

  return {
    pressedKeys: Array.from(pressedKeys.current),
    pushKey,
    isKeyPressed,
    clearAllKeys,
  };
}
