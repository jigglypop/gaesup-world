import { useCallback, useEffect, useState } from 'react';

import type { KeyboardState, MouseState } from '../../interactions/bridge';
import { useInputBackend } from '../../interactions/hooks';

export interface UseInteractionSystemResult {
  keyboard: KeyboardState;
  mouse: MouseState;
  updateKeyboard: (updates: Partial<KeyboardState>) => void;
  updateMouse: (updates: Partial<MouseState>) => void;
  dispatchInput: (updates: Partial<MouseState>) => void;
}

export function useInteractionSystem(): UseInteractionSystemResult {
  const inputBackend = useInputBackend();
  const [state, setState] = useState<{ keyboard: KeyboardState; mouse: MouseState }>(() => {
    return {
      keyboard: inputBackend.getKeyboard(),
      mouse: inputBackend.getMouse()
    };
  });

  useEffect(() => {
    setState({
      keyboard: inputBackend.getKeyboard(),
      mouse: inputBackend.getMouse(),
    });

    return inputBackend.subscribe?.((newState) => {
      setState({
        keyboard: newState.keyboard,
        mouse: newState.mouse,
      });
    });
  }, [inputBackend]);
  
  const updateKeyboard = useCallback((updates: Partial<KeyboardState>) => {
    inputBackend.updateKeyboard(updates);
    if (!inputBackend.subscribe) {
      setState({
        keyboard: inputBackend.getKeyboard(),
        mouse: inputBackend.getMouse(),
      });
    }
  }, [inputBackend]);
  
  const updateMouse = useCallback((updates: Partial<MouseState>) => {
    inputBackend.updateMouse(updates);
    if (!inputBackend.subscribe) {
      setState({
        keyboard: inputBackend.getKeyboard(),
        mouse: inputBackend.getMouse(),
      });
    }
  }, [inputBackend]);
  
  const dispatchInput = useCallback((updates: Partial<MouseState>) => {
    updateMouse(updates);
  }, [updateMouse]);
  
  return {
    keyboard: state.keyboard,
    mouse: state.mouse,
    updateKeyboard,
    updateMouse,
    dispatchInput,
  };
} 
