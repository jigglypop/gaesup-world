import { Vector3 } from 'three';
import type { RuntimeRecord } from '@core/boilerplate/types';
import { useNetworkBridge, UseNetworkBridgeOptions } from './useNetworkBridge';
export interface NPCConnectionOptions {
    position: Vector3;
    metadata?: RuntimeRecord;
    autoConnect?: boolean;
    connectionRange?: number;
}
export interface ConnectionOptions {
    reliable?: boolean;
    bandwidth?: number;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    timeout?: number;
}
export interface UseNPCConnectionOptions extends UseNetworkBridgeOptions {
    npcId: string;
    initialOptions?: NPCConnectionOptions;
}
export interface UseNPCConnectionResult {
    registerNPC: (options: NPCConnectionOptions) => void;
    unregisterNPC: () => void;
    updatePosition: (position: Vector3) => void;
    connectTo: (targetId: string, options?: ConnectionOptions) => void;
    disconnectFrom: (targetId: string) => void;
    isRegistered: boolean;
    getConnections: () => string[];
    getPosition: () => Vector3 | null;
    executeCommand: ReturnType<typeof useNetworkBridge>['executeCommand'];
    getSnapshot: ReturnType<typeof useNetworkBridge>['getSnapshot'];
    isReady: boolean;
}
/**
 * NPC 연결 관리를 위한 훅
 */
export declare function useNPCConnection(options: UseNPCConnectionOptions): UseNPCConnectionResult;
