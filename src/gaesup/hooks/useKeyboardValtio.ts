import { useEffect } from 'react';
import { gameActions } from '../store/actions';

const KEY_MAPPING = {
  KeyW: 'forward',
  KeyS: 'backward',
  KeyA: 'leftward',
  KeyD: 'rightward',
  ShiftLeft: 'shift',
  ShiftRight: 'shift',
  Space: 'space',
  KeyZ: 'keyZ',
  KeyR: 'keyR',
  KeyF: 'keyF',
  KeyE: 'keyE',
  Escape: 'escape',
} as const;

export function useKeyboard() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const mappedKey = KEY_MAPPING[event.code as keyof typeof KEY_MAPPING];
      if (mappedKey) {
        gameActions.updateKeyboard({ [mappedKey]: true });

        if (event.code === 'Space') {
          event.preventDefault();
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const mappedKey = KEY_MAPPING[event.code as keyof typeof KEY_MAPPING];
      if (mappedKey) {
        gameActions.updateKeyboard({ [mappedKey]: false });
      }
    };

    const handleBlur = () => {
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
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);
}
