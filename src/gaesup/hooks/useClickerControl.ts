import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { clickerAtom } from '../atoms';
import { keyboardInputAtom, pointerInputAtom } from '../atoms/unifiedInputAtom';

interface UseClickerControlOptions {
  stopOnBackward?: boolean;
  enabled?: boolean;
}

export function useClickerControl(options: UseClickerControlOptions = {}) {
  const { stopOnBackward = true, enabled = true } = options;
  const keyboard = useAtomValue(keyboardInputAtom);
  const clicker = useAtomValue(clickerAtom);
  const setClicker = useSetAtom(clickerAtom);
  const setPointerInput = useSetAtom(pointerInputAtom);
  useEffect(() => {
    if (!enabled) return;
    if (stopOnBackward && keyboard.backward && clicker.isOn) {
      setClicker((prev) => ({
        ...prev,
        isOn: false,
        isRun: false,
      }));
      setPointerInput((prev) => ({
        ...prev,
        isActive: false,
        shouldRun: false,
      }));
    }
  }, [keyboard.backward, clicker.isOn, stopOnBackward, enabled, setClicker, setPointerInput]);

  useEffect(() => {
    if (!enabled) return;
    if (keyboard.escape) {
      setClicker((prev) => ({
        ...prev,
        isOn: false,
        isRun: false,
      }));

      setPointerInput((prev) => ({
        ...prev,
        isActive: false,
        shouldRun: false,
      }));
    }
  }, [keyboard.escape, enabled, setClicker, setPointerInput]);

  return {
    isClickerActive: clicker.isOn,
    isClickerRunning: clicker.isRun,
  };
}
