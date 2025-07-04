import { useRef, useCallback, useEffect, useState } from 'react';
import { InteractionEngine } from '../../interactions/core/InteractionEngine';
import { KeyboardState, MouseState } from '../../interactions/core/InteractionEngine';

export interface UseInteractionEngineResult {
  keyboard: KeyboardState;
  mouse: MouseState;
  updateKeyboard: (updates: Partial<KeyboardState>) => void;
  updateMouse: (updates: Partial<MouseState>) => void;
  dispatchInput: (updates: Partial<MouseState>) => void;
}

export function useInteractionEngine(): UseInteractionEngineResult {
  const engineRef = useRef<InteractionEngine | null>(null);
  const [, forceUpdate] = useState({});
  
  if (!engineRef.current) {
    engineRef.current = InteractionEngine.getInstance();
  }
  
  const keyboard = engineRef.current.getKeyboardRef();
  const mouse = engineRef.current.getMouseRef();
  
  const updateKeyboard = useCallback((updates: Partial<KeyboardState>) => {
    engineRef.current?.updateKeyboard(updates);
    forceUpdate({});
  }, []);
  
  const updateMouse = useCallback((updates: Partial<MouseState>) => {
    engineRef.current?.updateMouse(updates);
    forceUpdate({});
  }, []);
  
  const dispatchInput = useCallback((updates: Partial<MouseState>) => {
    engineRef.current?.dispatchInput(updates);
    forceUpdate({});
  }, []);
  
  useEffect(() => {
    return () => {
      engineRef.current = null;
    };
  }, []);
  
  return {
    keyboard,
    mouse,
    updateKeyboard,
    updateMouse,
    dispatchInput,
  };
} 