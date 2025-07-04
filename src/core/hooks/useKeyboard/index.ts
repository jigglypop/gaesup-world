import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useGaesupStore } from '@stores/gaesupStore';
import { InteractionBridge } from '../../interactions/bridge/InteractionBridge';

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

let globalBridge: InteractionBridge | null = null;

function getGlobalBridge(): InteractionBridge {
  if (!globalBridge) {
    globalBridge = new InteractionBridge();
  }
  return globalBridge;
}

export const useKeyboard = (
  enableDiagonal = true,
  enableClicker = true,
  cameraOption?: any,
) => {
  const automation = useGaesupStore((state) => state.automation);
  const stopAutomation = useGaesupStore((state) => state.stopAutomation);
  const bridgeRef = useRef<InteractionBridge | null>(null);
  
  if (!bridgeRef.current) {
    bridgeRef.current = getGlobalBridge();
  }
  
  const pressedKeys = useRef<Set<string>>(new Set());

  const keyMapping = useMemo(() => ({ ...KEY_MAPPING }), []);

  const pushKey = useCallback(
    (key: string, value: boolean): boolean => {
      try {
        bridgeRef.current?.executeCommand({
          type: 'input',
          action: 'updateKeyboard',
          data: { [key]: value }
        });
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
    bridgeRef.current?.executeCommand({
      type: 'input',
      action: 'updateKeyboard',
      data: {
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
      }
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
          bridgeRef.current?.executeCommand({
            type: 'input',
            action: 'updateMouse',
            data: { isActive: false, shouldRun: false }
          });
        }

        console.log('Key pressed:', event.code, '->', mappedKey);
        bridgeRef.current?.executeCommand({
          type: 'input',
          action: 'updateKeyboard',
          data: { [mappedKey]: true }
        });
      } else if (!isDown && wasPressed) {
        pressedKeys.current.delete(event.code);
        console.log('Key released:', event.code, '->', mappedKey);
        bridgeRef.current?.executeCommand({
          type: 'input',
          action: 'updateKeyboard',
          data: { [mappedKey]: false }
        });
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
