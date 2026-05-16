import * as THREE from 'three';
import { NetworkSystemState, NetworkConfig, NetworkCommand, NetworkSnapshot } from '../types';
import { PerformanceMetrics, NetworkEvent } from './types';
export declare class NetworkSystem {
    private state;
    private npcManager;
    private messageQueue;
    private connectionPool;
    private config;
    private lastCleanupTime;
    private lastStatsUpdateAt;
    private updateTimer;
    private scratchNodeIds;
    private scratchGroupIds;
    private scratchRemoveIds;
    private messageQueueSig;
    constructor(config: NetworkConfig);
    start(): void;
    stop(): void;
    private startUpdateLoop;
    private update;
    private processMessageBatch;
    private updateStatistics;
    private calculateMessagesPerSecond;
    private syncState;
    executeCommand(command: NetworkCommand): boolean;
    createSnapshot(): NetworkSnapshot;
    updateConfig(partialConfig: Partial<NetworkConfig>): void;
    registerNPC(npcId: string, position: THREE.Vector3, options?: {
        communicationRange?: number;
        signalStrength?: number;
    }): import("..").NPCNetworkNode;
    unregisterNPC(npcId: string): boolean;
    updateNPCPosition(npcId: string, position: THREE.Vector3): boolean;
    getMessages(npcId: string): import("..").NetworkMessage[];
    getState(): NetworkSystemState;
    getConfig(): NetworkConfig;
    dispose(): void;
    addEventListener(eventType: NetworkEvent['type'], callback: (event: NetworkEvent) => void): void;
    removeEventListener(eventType: NetworkEvent['type'], callback: (event: NetworkEvent) => void): void;
    getDebugInfo(): {
        isRunning: boolean;
        config: NetworkConfig;
        stats: import("..").NetworkStats;
        networkStats: {
            nodeCount: number;
            connectionCount: number;
            groupCount: number;
            averageConnections: number;
            totalMessages: number;
        };
        performanceMetrics: PerformanceMetrics;
        poolStats: {
            available: number;
            active: number;
            total: number;
            maxSize: number;
            utilizationRate: number;
        };
        messageQueueStats: {
            totalMessages: number;
            queueSizes: Record<string, number>;
            maxSize: number;
            batchSize: number;
            enableBatching: boolean;
        };
    };
}
