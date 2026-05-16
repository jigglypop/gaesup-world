import type { KeyboardState, MouseState } from '../../interactions/bridge';
export interface UseInteractionSystemResult {
    keyboard: KeyboardState;
    mouse: MouseState;
    updateKeyboard: (updates: Partial<KeyboardState>) => void;
    updateMouse: (updates: Partial<MouseState>) => void;
    dispatchInput: (updates: Partial<MouseState>) => void;
}
export declare function useInteractionSystem(): UseInteractionSystemResult;
