import { useRef, useCallback, useEffect, useState } from 'react';
import { InteractionBridge } from '../../interactions/bridge/InteractionBridge';
import { KeyboardState, MouseState } from '../../interactions/core/InteractionEngine';

export interface UseInteractionEngineResult {
  keyboard: KeyboardState;
  mouse: MouseState;
  updateKeyboard: (updates: Partial<KeyboardState>) => void;
  updateMouse: (updates: Partial<MouseState>) => void;
  dispatchInput: (updates: Partial<MouseState>) => void;
}

let globalBridge: InteractionBridge | null = null;
function getGlobalBridge(): InteractionBridge {
  if (!globalBridge) {
    globalBridge = new InteractionBridge();
  }
  return globalBridge;
}

export function useInteractionEngine(): UseInteractionEngineResult {
  const bridgeRef = useRef<InteractionBridge | null>(null);
  const [state, setState] = useState<{ keyboard: KeyboardState; mouse: MouseState }>(() => {
    const bridge = getGlobalBridge();
    return {
      keyboard: bridge.getKeyboardState(),
      mouse: bridge.getMouseState()
    };
  });
  
  if (!bridgeRef.current) {
    bridgeRef.current = getGlobalBridge();
  }
  
  useEffect(() => {
    const bridge = bridgeRef.current!;
    const unsubscribe = bridge.subscribe((newState) => {
      setState(newState);
    });
    
    return unsubscribe;
  }, []);
  
  const updateKeyboard = useCallback((updates: Partial<KeyboardState>) => {
    bridgeRef.current?.executeCommand({
      type: 'input',
      action: 'updateKeyboard',
      data: updates
    });
  }, []);
  
  const updateMouse = useCallback((updates: Partial<MouseState>) => {
    bridgeRef.current?.executeCommand({
      type: 'input',
      action: 'updateMouse',
      data: updates
    });
  }, []);
  
  const dispatchInput = useCallback((updates: Partial<MouseState>) => {
    bridgeRef.current?.executeCommand({
      type: 'input',
      action: 'updateMouse',
      data: updates
    });
  }, []);
  
  return {
    keyboard: state.keyboard,
    mouse: state.mouse,
    updateKeyboard,
    updateMouse,
    dispatchInput,
  };
} 