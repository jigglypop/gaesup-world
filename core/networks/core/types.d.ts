export interface MessageProcessResult {
    success: boolean;
    messageId: string;
    error?: string;
    latency?: number;
}
export interface ConnectionOptions {
    timeout: number;
    retries: number;
    bandwidth: number;
    encryption: boolean;
}
export interface GroupCreateOptions {
    type: 'party' | 'proximity' | 'broadcast' | 'guild';
    maxMembers: number;
    range: number;
    persistent: boolean;
    autoJoin: boolean;
}
export interface NetworkEvent {
    type: 'nodeConnected' | 'nodeDisconnected' | 'messageReceived' | 'groupJoined' | 'groupLeft';
    nodeId: string;
    data?: NetworkPayload;
    timestamp: number;
}
export interface PerformanceMetrics {
    messagesProcessed: number;
    averageLatency: number;
    bandwidth: number;
    connectionCount: number;
    errorRate: number;
    lastUpdate: number;
}
import type { NetworkPayload } from '../types';
