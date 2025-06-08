import { useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { gameStore } from '../../store/gameStore';
import { gameActions } from '../../store/actions';
import { KEY_MAPPING } from '../../tools/constants';

export function useKeyboard() {
  const clicker = useSnapshot(gameStore.input.pointer);
  const pressedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const mappedKey = KEY_MAPPING[event.code as keyof typeof KEY_MAPPING];
      if (mappedKey && !pressedKeys.current.has(event.code)) {
        pressedKeys.current.add(event.code);
        if (event.code === 'Space') {
          event.preventDefault();
        }
        if (event.code === 'KeyS' && clicker.isActive) {
          gameActions.updatePointer({
            isActive: false,
            shouldRun: false,
          });
        }
        gameActions.updateKeyboard({
          [mappedKey]: true,
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const mappedKey = KEY_MAPPING[event.code as keyof typeof KEY_MAPPING];
      if (mappedKey && pressedKeys.current.has(event.code)) {
        pressedKeys.current.delete(event.code);
        gameActions.updateKeyboard({
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
  }, [clicker.isActive]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pressedKeys.current.clear();
        gameActions.updateKeyboard({
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
  }, []);

  return {
    pressedKeys: Array.from(pressedKeys.current),
  };
}
