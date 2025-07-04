import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useGaesupStore } from '@stores/gaesupStore';
import { InteractionEngine } from '../../interactions/core/InteractionEngine';

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
  cameraOption?: any,
) => {
  const automation = useGaesupStore((state) => state.automation);
  const stopAutomation = useGaesupStore((state) => state.stopAutomation);
  const interactionEngine = InteractionEngine.getInstance();
  
  const pressedKeys = useRef<Set<string>>(new Set());

  const keyMapping = useMemo(() => ({ ...KEY_MAPPING }), []);

  const pushKey = useCallback(
    (key: string, value: boolean): boolean => {
      try {
        interactionEngine.updateKeyboard({ [key]: value });
        value ? pressedKeys.current.add(key) : pressedKeys.current.delete(key);
        return true;
      } catch (error) {
        console.error('Error updating keyboard state:', error);
        return false;
      }
    },
    [],
  );

  const clearAllKeys = useCallback(() => {
    pressedKeys.current.clear();
    interactionEngine.updateKeyboard({
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
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent, isDown: boolean) => {
      const mappedKey = keyMapping[event.code];
      if (!mappedKey) return;

      const wasPressed = pressedKeys.current.has(event.code);

      if (isDown && !wasPressed) {
        pressedKeys.current.add(event.code);
        if (event.code === 'Space') event.preventDefault();

        if (enableClicker && event.code === 'KeyS' && automation?.queue.isRunning) {
          stopAutomation();
          interactionEngine.updateMouse({ isActive: false, shouldRun: false });
        }

        console.log('Key pressed:', event.code, '->', mappedKey);
        interactionEngine.updateKeyboard({ [mappedKey]: true });
      } else if (!isDown && wasPressed) {
        pressedKeys.current.delete(event.code);
        console.log('Key released:', event.code, '->', mappedKey);
        interactionEngine.updateKeyboard({ [mappedKey]: false });
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
    automation,
    clearAllKeys,
  ]);

  return {
    pressedKeys: Array.from(pressedKeys.current),
    pushKey,
    isKeyPressed: (key: string) => pressedKeys.current.has(key),
    clearAllKeys,
  };
};
