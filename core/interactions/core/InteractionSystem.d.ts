import { AbstractSystem } from '@/core/boilerplate/entity/AbstractSystem';
import type { SystemContext } from '@/core/boilerplate/entity/BaseSystem';
import type { BaseState, BaseMetrics, SystemUpdateArgs } from '@/core/boilerplate/types';
import { InteractionState, InteractionConfig, InteractionMetrics, KeyboardState, MouseState, GamepadState, TouchState } from '../bridge';
type InteractionEventPayload = Partial<KeyboardState> | Partial<MouseState> | Partial<GamepadState> | Partial<TouchState>;
interface InteractionSystemState extends BaseState, InteractionState {
}
interface InteractionSystemMetrics extends BaseMetrics, InteractionMetrics {
}
export declare class InteractionSystem extends AbstractSystem<InteractionSystemState, InteractionSystemMetrics> {
    private static instance;
    private config;
    private eventCallbacks;
    constructor();
    static getInstance(): InteractionSystem;
    protected performUpdate(args: SystemUpdateArgs): void;
    protected createUpdateArgs(context: SystemContext): SystemUpdateArgs;
    private createDefaultConfig;
    getKeyboardRef(): KeyboardState;
    getMouseRef(): MouseState;
    updateKeyboard(updates: Partial<KeyboardState>): void;
    updateMouse(updates: Partial<MouseState>): void;
    updateGamepad(updates: Partial<GamepadState>): void;
    updateTouch(updates: Partial<TouchState>): void;
    private emitChange;
    dispatchInput(updates: Partial<MouseState>): void;
    setConfig(updates: Partial<InteractionConfig>): void;
    getConfig(): InteractionConfig;
    addEventListener(event: string, callback: (data: InteractionEventPayload) => void): void;
    removeEventListener(event: string, callback: (data: InteractionEventPayload) => void): void;
    protected updateMetrics(deltaTime: number): void;
    private collectActiveInputs;
    protected onReset(): void;
    protected onDispose(): void;
}
export type { KeyboardState, MouseState } from '../bridge';
