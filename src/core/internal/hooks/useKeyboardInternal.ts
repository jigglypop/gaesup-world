import { useEffect, useRef } from 'react';
import { inputStore, handleKeyDown, handleKeyUp } from '../stores/inputStore';

interface KeyboardInternalOptions {
  preventDefault?: boolean;
  enabled?: boolean;
}

export function useKeyboardInternal(options: KeyboardInternalOptions = {}) {
  const { preventDefault = true, enabled = true } = options;
  const pressedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (pressedKeys.current.has(e.code)) return;
      pressedKeys.current.add(e.code);
      if (e.code === 'Space' && preventDefault) {
        e.preventDefault();
      }
      handleKeyDown(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.code);
      handleKeyUp(e.code);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        pressedKeys.current.clear();
        inputStore.getState().resetKeyboard();
      }
    };

    const onBlur = () => {
      pressedKeys.current.clear();
      inputStore.getState().resetKeyboard();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      
      // Clean up on unmount
      pressedKeys.current.clear();
      inputStore.getState().resetKeyboard();
    };
  }, [enabled, preventDefault]);

  return {
    // These methods don't trigger re-renders
    isKeyPressed: (key: string) => {
      const keyboard = inputStore.getState().keyboard;
      return keyboard[key as keyof typeof keyboard] || false;
    },
    getPressedKeys: () => Array.from(pressedKeys.current),
    getKeyboardState: () => inputStore.getState().keyboard,
  };
}
