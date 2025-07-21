import { useState, useEffect, useCallback } from 'react';
import { useNetworkBridge, UseNetworkBridgeOptions } from './useNetworkBridge';

export interface NetworkStats {
  // 기본 통계
  totalNodes: number;
  totalConnections: number;
  totalMessages: number;
  averageLatency: number;
  messagesPerSecond: number;
  
  // 연결 통계
  activeConnections: number;
  failedConnections: number;
  connectionSuccessRate: number;
  
  // 메시지 통계
  sentMessages: number;
  receivedMessages: number;
  failedMessages: number;
  messageSuccessRate: number;
  
  // 성능 통계
  updateTime: number;
  messageProcessingTime: number;
  connectionProcessingTime: number;
  
  // 그룹 통계
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
  // 현재 통계
  stats: NetworkStats | null;
  
  // 기록된 통계 (옵션)
  statsHistory: NetworkStats[];
  
  // 통계 조회
  refreshStats: () => void;
  getHistoricalAverage: (field: keyof NetworkStats) => number;
  getPeakValue: (field: keyof NetworkStats) => number;
  
  // 상태
  isLoading: boolean;
  lastUpdate: number;
  
  // 브릿지 기능
  isReady: boolean;
}

/**
 * 네트워크 통계 조회를 위한 훅
 */
export function useNetworkStats(options: UseNetworkStatsOptions = {}): UseNetworkStatsResult {
  const {
    updateInterval = 1000,
    enableRealTime = true,
    trackHistory = false,
    historyLength = 100,
    ...bridgeOptions
  } = options;

  const {
    getSnapshot,
    getNetworkStats,
    isReady
  } = useNetworkBridge(bridgeOptions);

  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [statsHistory, setStatsHistory] = useState<NetworkStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  // 통계 수집 함수
  const collectStats = useCallback((): NetworkStats | null => {
    if (!isReady) return null;

    const snapshot = getSnapshot();
    const networkStats = getNetworkStats();
    
    if (!snapshot || !networkStats) return null;

    // 기본 통계
    const totalNodes = snapshot.nodes.size;
    const totalConnections = snapshot.connections.size;
    const totalMessages = snapshot.messages.length;

    // 연결 통계
    const activeConnections = Array.from(snapshot.connections.values())
      .filter(conn => conn.state === 'connected').length;
    const failedConnections = Array.from(snapshot.connections.values())
      .filter(conn => conn.state === 'failed').length;
    const connectionSuccessRate = totalConnections > 0 
      ? (activeConnections / totalConnections) * 100 
      : 100;

    // 메시지 통계
    const recentMessages = snapshot.messages.filter(msg => 
      Date.now() - msg.timestamp < updateInterval
    );
    const messagesPerSecond = (recentMessages.length / updateInterval) * 1000;

    // 성능 통계
    const performance = snapshot.performance || {
      updateTime: 0,
      messageProcessingTime: 0,
      connectionProcessingTime: 0
    };

    // 그룹 통계
    const totalGroups = snapshot.groups.size;
    const groups = Array.from(snapshot.groups.values());
    const activeGroups = groups.filter(group => group.members.length > 1).length;
    const averageGroupSize = totalGroups > 0 
      ? groups.reduce((sum, group) => sum + group.members.length, 0) / totalGroups 
      : 0;

    return {
      // 기본 통계
      totalNodes,
      totalConnections,
      totalMessages,
      averageLatency: networkStats.averageLatency || 0,
      messagesPerSecond,
      
      // 연결 통계
      activeConnections,
      failedConnections,
      connectionSuccessRate,
      
      // 메시지 통계
      sentMessages: networkStats.totalMessages || 0,
      receivedMessages: networkStats.totalMessages || 0,
      failedMessages: 0,
      messageSuccessRate: 100,
      
      // 성능 통계
      updateTime: performance.updateTime,
      messageProcessingTime: performance.messageProcessingTime,
      connectionProcessingTime: performance.connectionProcessingTime,
      
      // 그룹 통계
      totalGroups,
      activeGroups,
      averageGroupSize
    };
  }, [isReady, getSnapshot, getNetworkStats, updateInterval]);

  // 통계 새로고침
  const refreshStats = useCallback(() => {
    setIsLoading(true);
    
    const newStats = collectStats();
    if (newStats) {
      setStats(newStats);
      setLastUpdate(Date.now());
      
      // 기록 추가 (옵션)
      if (trackHistory) {
        setStatsHistory(prev => {
          const updated = [...prev, newStats];
          return updated.length > historyLength 
            ? updated.slice(-historyLength)
            : updated;
        });
      }
    }
    
    setIsLoading(false);
  }, [collectStats, trackHistory, historyLength]);

  // 실시간 업데이트
  useEffect(() => {
    if (!enableRealTime || !isReady) return;

    const interval = setInterval(() => {
      refreshStats();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [enableRealTime, isReady, refreshStats, updateInterval]);

  // 초기 로드
  useEffect(() => {
    if (isReady) {
      refreshStats();
    }
  }, [isReady, refreshStats]);

  // 기록된 통계의 평균값 계산
  const getHistoricalAverage = useCallback((field: keyof NetworkStats): number => {
    if (statsHistory.length === 0) return 0;
    
    const sum = statsHistory.reduce((acc, stat) => acc + (stat[field] as number), 0);
    return sum / statsHistory.length;
  }, [statsHistory]);

  // 기록된 통계의 최대값 계산
  const getPeakValue = useCallback((field: keyof NetworkStats): number => {
    if (statsHistory.length === 0) return 0;
    
    return Math.max(...statsHistory.map(stat => stat[field] as number));
  }, [statsHistory]);

  return {
    // 현재 통계
    stats,
    
    // 기록된 통계
    statsHistory: trackHistory ? statsHistory : [],
    
    // 통계 조회
    refreshStats,
    getHistoricalAverage,
    getPeakValue,
    
    // 상태
    isLoading,
    lastUpdate,
    
    // 브릿지 기능
    isReady
  };
} 