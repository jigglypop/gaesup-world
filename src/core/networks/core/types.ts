// 메시지 처리 결과
export type MessageProcessResult = {
  success: boolean;
  messageId: string;
  error?: string;
  latency?: number;
};

// 연결 설정 옵션
export type ConnectionOptions = {
  timeout: number;
  retries: number;
  bandwidth: number;
  encryption: boolean;
};

// 그룹 생성 옵션
export type GroupCreateOptions = {
  type: 'party' | 'proximity' | 'broadcast' | 'guild';
  maxMembers: number;
  range: number;
  persistent: boolean;
  autoJoin: boolean;
};

// 네트워크 이벤트
export type NetworkEvent = {
  type: 'nodeConnected' | 'nodeDisconnected' | 'messageReceived' | 'groupJoined' | 'groupLeft';
  nodeId: string;
  data?: NetworkPayload;
  timestamp: number;
};

// 성능 메트릭
export type PerformanceMetrics = {
  messagesProcessed: number;
  averageLatency: number;
  bandwidth: number;
  connectionCount: number;
  errorRate: number;
  lastUpdate: number;
}; 
import type { NetworkPayload } from '../types';
