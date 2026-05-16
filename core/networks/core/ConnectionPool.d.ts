import { NetworkConnection } from '../types';
import { ConnectionOptions } from './types';
export declare class ConnectionPool {
    private availableConnections;
    private activeConnections;
    private connectionIdCounter;
    private maxPoolSize;
    private defaultOptions;
    constructor(maxPoolSize?: number, defaultOptions?: Partial<ConnectionOptions>);
    private createConnection;
    getConnection(nodeA: string, nodeB: string, options?: Partial<ConnectionOptions>): NetworkConnection;
    releaseConnection(connectionId: string): boolean;
    private resetConnection;
    getActiveConnection(connectionId: string): NetworkConnection | null;
    findActiveConnection(nodeA: string, nodeB: string): NetworkConnection | null;
    updateConnectionStatus(connectionId: string, status: NetworkConnection['status']): boolean;
    updateConnectionMetrics(connectionId: string, metrics: {
        latency?: number;
        bandwidth?: number;
        strength?: number;
    }): boolean;
    cleanupInactiveConnections(maxAge?: number): number;
    getPoolStats(): {
        available: number;
        active: number;
        total: number;
        maxSize: number;
        utilizationRate: number;
    };
    clear(): void;
    disconnectNode(nodeId: string): number;
    updatePoolSettings(maxPoolSize: number, defaultOptions?: Partial<ConnectionOptions>): void;
}
