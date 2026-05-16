import { UseNetworkBridgeOptions } from './useNetworkBridge';
export interface NetworkStats {
    totalNodes: number;
    totalConnections: number;
    totalMessages: number;
    averageLatency: number;
    messagesPerSecond: number;
    activeConnections: number;
    failedConnections: number;
    connectionSuccessRate: number;
    sentMessages: number;
    receivedMessages: number;
    failedMessages: number;
    messageSuccessRate: number;
    updateTime: number;
    messageProcessingTime: number;
    connectionProcessingTime: number;
    totalGroups: number;
    activeGroups: number;
    averageGroupSize: number;
}
export interface UseNetworkStatsOptions extends UseNetworkBridgeOptions {
    updateInterval?: number;
    enableRealTime?: boolean;
    trackHistory?: boolean;
    historyLength?: number;
}
export interface UseNetworkStatsResult {
    stats: NetworkStats | null;
    statsHistory: NetworkStats[];
    refreshStats: () => void;
    getHistoricalAverage: (field: keyof NetworkStats) => number;
    getPeakValue: (field: keyof NetworkStats) => number;
    isLoading: boolean;
    lastUpdate: number;
    isReady: boolean;
}
/**
 * 네트워크 통계 조회를 위한 훅
 */
export declare function useNetworkStats(options?: UseNetworkStatsOptions): UseNetworkStatsResult;
