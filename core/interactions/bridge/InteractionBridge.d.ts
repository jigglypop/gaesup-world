import type { BridgeCommand, BridgeEvent, BridgeSnapshot } from './types';
import { type InputBackend } from '../core/adapter';
import { AutomationSystem } from '../core/AutomationSystem';
import type { InteractionSystem, KeyboardState, MouseState } from '../core/InteractionSystem';
export interface InteractionBridgeOptions {
    interactionSystem?: InteractionSystem;
    inputBackend?: InputBackend;
    automationSystem?: AutomationSystem;
}
export declare class InteractionBridge {
    private static globalInstance;
    static getGlobal(): InteractionBridge;
    static disposeGlobal(): void;
    private interactionSystem;
    private inputBackend;
    private automationSystem;
    private state;
    private eventSubscribers;
    private eventQueue;
    private syncTimer;
    private visibilityCleanup;
    private readonly MAX_COMMAND_HISTORY;
    private readonly MAX_EVENT_QUEUE;
    private readonly SYNC_DELAY_MS;
    private engineListenerCleanups;
    private eventListeners;
    private interactables;
    private hoveredInteractableIds;
    constructor(options?: InteractionBridgeOptions);
    private setupEngineListeners;
    executeCommand(command: Omit<BridgeCommand, 'timestamp'>): void;
    private handleInputCommand;
    private handleAutomationCommand;
    snapshot(): BridgeSnapshot;
    subscribe(listener: (state: {
        keyboard: KeyboardState;
        mouse: MouseState;
    }) => void): () => void;
    subscribe(event: string, callback: (event: BridgeEvent) => void): () => void;
    unsubscribe(event: string, callback: (event: BridgeEvent) => void): void;
    private notifyListeners;
    private createInteractionSnapshot;
    registerInteractable(entity: {
        id: string;
        active?: boolean;
        onPointerOver?: () => void;
        onPointerOut?: () => void;
        onClick?: () => void;
    }): void;
    unregisterInteractable(id: string): void;
    getInteractable(id: string): {
        id: string;
        active?: boolean;
        onPointerOver?: () => void;
        onPointerOut?: () => void;
        onClick?: () => void;
    } | undefined;
    updateHoveredObjects(hitObjects: Array<{
        object?: {
            userData?: {
                id?: string;
            };
        };
    }>): void;
    handleClick(event: {
        object?: {
            userData?: {
                id?: string;
            };
        };
    }): void;
    private emitEvent;
    private dispatchEvent;
    private setupVisibilityListener;
    private cancelSync;
    private scheduleSync;
    private processEventQueue;
    private updateMetrics;
    getInteractionSystem(): InteractionSystem;
    getAutomationSystem(): AutomationSystem;
    reset(): void;
    dispose(): void;
    cleanup(): void;
    getKeyboardState(): KeyboardState;
    getMouseState(): MouseState;
}
