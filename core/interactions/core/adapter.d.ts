import { InteractionSystem } from './InteractionSystem';
import type { GamepadState, KeyboardState, MouseState, TouchState } from '../bridge';
export declare const DEFAULT_INTERACTION_INPUT_EXTENSION_ID = "interaction.input";
export interface InputBackendSnapshot {
    keyboard: KeyboardState;
    mouse: MouseState;
    gamepad?: GamepadState;
    touch?: TouchState;
}
export type InputStateListener = (state: InputBackendSnapshot) => void;
export interface InputBackend {
    getKeyboard(): KeyboardState;
    getMouse(): MouseState;
    getGamepad?(): GamepadState;
    getTouch?(): TouchState;
    updateKeyboard(input: Partial<KeyboardState>): void;
    updateMouse(input: Partial<MouseState>): void;
    updateGamepad?(input: Partial<GamepadState>): void;
    updateTouch?(input: Partial<TouchState>): void;
    subscribe?(listener: InputStateListener): () => void;
}
export type InputAdapter = InputBackend;
export interface InputBackendExtension {
    createAdapter: () => InputBackend;
}
export type InteractionSystemResolver = () => InteractionSystem;
export interface MemoryInputBackendInitialState {
    keyboard?: Partial<KeyboardState>;
    mouse?: Partial<MouseState> & {
        buttons?: Partial<MouseState['buttons']>;
    };
    gamepad?: Partial<GamepadState> & {
        triggers?: Partial<GamepadState['triggers']>;
        vibration?: Partial<GamepadState['vibration']>;
    };
    touch?: Partial<TouchState> & {
        gestures?: Partial<TouchState['gestures']>;
    };
}
export declare function resolveDefaultInteractionSystem(): InteractionSystem;
export declare function setDefaultInteractionSystemResolver(resolver: InteractionSystemResolver): () => void;
export declare function createInteractionSystemInputBackend(system: InteractionSystem): InputBackend;
export declare function getDefaultInteractionInputBackend(): InputBackend;
export declare function createDefaultInteractionInputBackend(): InputBackend;
export declare function createInteractionInputAdapter(system?: InteractionSystem): InputAdapter;
export declare function createMemoryInputBackend(initialState?: MemoryInputBackendInitialState): InputBackend;
