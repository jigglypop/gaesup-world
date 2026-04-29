import { InteractionSystem } from './InteractionSystem';
import type { KeyboardState, MouseState } from '../bridge';

export interface InputAdapter {
  getKeyboard(): KeyboardState;
  getMouse(): MouseState;
  updateKeyboard(input: Partial<KeyboardState>): void;
  updateMouse(input: Partial<MouseState>): void;
}

export function createInteractionInputAdapter(system = InteractionSystem.getInstance()): InputAdapter {
  return {
    getKeyboard: () => system.getKeyboardRef(),
    getMouse: () => system.getMouseRef(),
    updateKeyboard: (input) => system.updateKeyboard(input),
    updateMouse: (input) => system.updateMouse(input),
  };
}
