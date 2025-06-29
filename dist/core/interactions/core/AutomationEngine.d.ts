import * as THREE from 'three';
export interface AutomationAction {
    id: string;
    type: 'move' | 'click' | 'wait' | 'key' | 'custom';
    target?: THREE.Vector3;
    key?: string;
    duration?: number;
    delay?: number;
    beforeCallback?: () => void;
    afterCallback?: () => void;
    data?: Record<string, unknown>;
    timestamp?: number;
}
export interface AutomationQueue {
    actions: AutomationAction[];
    currentIndex: number;
    isRunning: boolean;
    isPaused: boolean;
    loop: boolean;
    maxRetries: number;
}
export interface AutomationState {
    isActive: boolean;
    queue: AutomationQueue;
    currentAction: AutomationAction | null;
    executionStats: {
        totalExecuted: number;
        successRate: number;
        averageTime: number;
        errors: string[];
    };
    settings: {
        throttle: number;
        autoStart: boolean;
        trackProgress: boolean;
        showVisualCues: boolean;
    };
}
export interface AutomationConfig {
    maxConcurrentActions: number;
    defaultDelay: number;
    retryDelay: number;
    timeoutDuration: number;
    enableLogging: boolean;
    visualCues: {
        showPath: boolean;
        showTargets: boolean;
        lineColor: string;
        targetColor: string;
    };
}
export interface AutomationMetrics {
    queueLength: number;
    executionTime: number;
    performance: number;
    memoryUsage: number;
    errorRate: number;
}
export declare class AutomationEngine {
    private state;
    private config;
    private metrics;
    private executionTimer;
    private eventCallbacks;
    constructor();
    private createDefaultState;
    private createDefaultConfig;
    private createDefaultMetrics;
    addAction(action: Omit<AutomationAction, 'id' | 'timestamp'>): string;
    removeAction(id: string): boolean;
    clearQueue(): void;
    start(): void;
    pause(): void;
    resume(): void;
    stop(): void;
    private executeNext;
    private executeAction;
    private handleExecutionError;
    private updateExecutionStats;
    private updateMetrics;
    private emit;
    addEventListener(event: string, callback: Function): void;
    removeEventListener(event: string, callback: Function): void;
    getState(): AutomationState;
    getConfig(): AutomationConfig;
    getMetrics(): AutomationMetrics;
    setConfig(updates: Partial<AutomationConfig>): void;
    updateSettings(updates: Partial<AutomationState['settings']>): void;
    reset(): void;
    dispose(): void;
}
