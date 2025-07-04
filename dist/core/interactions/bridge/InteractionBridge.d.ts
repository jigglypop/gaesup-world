import { InteractionEngine, KeyboardState, MouseState } from '../core/InteractionEngine';
import { AutomationEngine } from '../core/AutomationEngine';
import { InteractionSnapshot } from './types';
export interface BridgeCommand {
    type: 'input' | 'automation';
    action: string;
    data?: unknown;
    timestamp?: number;
}
export interface BridgeState {
    isActive: boolean;
    lastCommand: BridgeCommand | null;
    commandHistory: BridgeCommand[];
    syncStatus: 'idle' | 'syncing' | 'error';
}
export interface BridgeEvent {
    type: 'input' | 'automation' | 'sync';
    event: string;
    data?: unknown;
    timestamp: number;
}
export declare class InteractionBridge {
    private interactionEngine;
    private automationEngine;
    private state;
    private eventSubscribers;
    private eventQueue;
    private syncInterval;
    private readonly MAX_COMMAND_HISTORY;
    private readonly MAX_EVENT_QUEUE;
    private engineListenerCleanups;
    private eventListeners;
    constructor();
    private setupEngineListeners;
    executeCommand(command: Omit<BridgeCommand, 'timestamp'>): void;
    private handleInputCommand;
    private handleAutomationCommand;
    snapshot(): InteractionSnapshot;
    subscribe(listener: (state: {
        keyboard: KeyboardState;
        mouse: MouseState;
    }) => void): () => void;
    private notifyListeners;
    private emitEvent;
    private startSync;
    private processEventQueue;
    private updateMetrics;
    getInteractionEngine(): InteractionEngine;
    getAutomationEngine(): AutomationEngine;
    reset(): void;
    dispose(): void;
    getKeyboardState(): KeyboardState;
    getMouseState(): MouseState;
}
