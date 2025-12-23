import { NetworkConfig } from '../types';

/**
 * 네트워크 브릿지 설정 스토어 인터페이스
 */
export interface NetworkConfigStore {
  config: NetworkConfig;
  updateConfig: (config: Partial<NetworkConfig>) => void;
  resetConfig: () => void;
}

/**
 * 브릿지 이벤트 타입
 */
export interface NetworkBridgeEvent {
  type: 'connection' | 'message' | 'error' | 'performance';
  timestamp: number;
  data: unknown;
}

/**
 * 네트워크 브릿지 상태
 */
export interface NetworkBridgeState {
  isActive: boolean;
  systemCount: number;
  totalConnections: number;
  totalMessages: number;
  lastUpdate: number;
}

/**
 * 네트워크 브릿지 메트릭
 */
export interface NetworkBridgeMetrics {
  averageLatency: number;
  messagesPerSecond: number;
  connectionsPerSecond: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

/**
 * 브릿지 생성 옵션
 */
export interface NetworkBridgeOptions {
  enableMetrics?: boolean;
  enableEventLog?: boolean;
  cacheTimeout?: number;
  maxSystems?: number;
} 