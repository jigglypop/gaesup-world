import type { Vector3 } from 'three';
import { AbstractSystem } from '@/core/boilerplate/entity/AbstractSystem';
import type { SystemContext } from '@/core/boilerplate/entity/BaseSystem';
import type { BaseState, BaseMetrics, SystemUpdateArgs } from '@/core/boilerplate/types';
import { AutomationState, AutomationConfig, AutomationMetrics, AutomationAction } from '../bridge/types';
interface AutomationSystemState extends BaseState, AutomationState {
}
interface AutomationSystemMetrics extends BaseMetrics, AutomationMetrics {
}
type AutomationEventPayload = AutomationAction | AutomationAction['data'] | Vector3 | string | {
    action: AutomationAction;
    error: Error;
} | undefined;
export declare class AutomationSystem extends AbstractSystem<AutomationSystemState, AutomationSystemMetrics> {
    private config;
    private executionTimer;
    private eventCallbacks;
    constructor();
    protected performUpdate(args: SystemUpdateArgs): void;
    protected createUpdateArgs(context: SystemContext): SystemUpdateArgs;
    private createDefaultConfig;
    getConfig(): AutomationConfig;
    addAction(action: Omit<AutomationAction, 'id' | 'timestamp'>): string;
    removeAction(id: string): boolean;
    clearQueue(): void;
    start(): Promise<void>;
    pause(): void;
    resume(): void;
    stop(): void;
    private executeNext;
    private executeAction;
    private handleExecutionError;
    private updateExecutionStats;
    protected updateMetrics(deltaTime: number): void;
    private emit;
    addEventListener(event: string, callback: (data: AutomationEventPayload) => void): void;
    removeEventListener(event: string, callback: (data: AutomationEventPayload) => void): void;
    updateSettings(updates: Partial<AutomationState['settings']>): void;
    protected onReset(): void;
    protected onDispose(): void;
}
export {};
