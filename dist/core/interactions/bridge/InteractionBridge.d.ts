import { InteractionEngine } from '../core/InteractionEngine';
import { AutomationEngine } from '../core/AutomationEngine';
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
    constructor();
    private setupEngineListeners;
    executeCommand(command: Omit<BridgeCommand, 'timestamp'>): void;
    private handleInputCommand;
    private handleAutomationCommand;
    snapshot(): {
        interaction: any;
        automation: any;
        bridge: BridgeState;
    };
    subscribe(event: string, callback: Function): void;
    unsubscribe(event: string, callback: Function): void;
    private emitEvent;
    private startSync;
    private processEventQueue;
    private updateMetrics;
    getInteractionEngine(): InteractionEngine;
    getAutomationEngine(): AutomationEngine;
    reset(): void;
    dispose(): void;
}
