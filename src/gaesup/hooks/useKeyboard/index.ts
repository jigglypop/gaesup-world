import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { clickerAtom } from '../../atoms';
import { keyboardInputAtom, pointerInputAtom } from '../../atoms/inputAtom';
import { KEY_MAPPING } from '../../tools/constants';

export function useKeyboard() {
  const clicker = useAtomValue(clickerAtom);
  const setClicker = useSetAtom(clickerAtom);
  const setKeyboardInput = useSetAtom(keyboardInputAtom);
  const setPointerInput = useSetAtom(pointerInputAtom);
  const pressedKeys = useRef<Set<string>>(new Set());
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const mappedKey = KEY_MAPPING[event.code as keyof typeof KEY_MAPPING];
      if (mappedKey && !pressedKeys.current.has(event.code)) {
        pressedKeys.current.add(event.code);
        if (event.code === 'Space') {
          event.preventDefault();
        }
        if (event.code === 'KeyS' && clicker.isOn) {
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
      const mappedKey = KEY_MAPPING[event.code as keyof typeof KEY_MAPPING];
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
  }, [clicker, setClicker, setKeyboardInput, setPointerInput]);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
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
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setKeyboardInput]);
  return {
    pressedKeys: Array.from(pressedKeys.current),
  };
}
