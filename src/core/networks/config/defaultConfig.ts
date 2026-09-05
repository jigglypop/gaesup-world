import { MultiplayerConfig } from '../types';

export const defaultMultiplayerConfig: MultiplayerConfig = {
  // 기본 NetworkConfig
  updateFrequency: 30,
  maxConnections: 100,
  messageQueueSize: 1000,
  
  // 통신 설정
  maxDistance: 100.0,
  signalStrength: 1.0,
  bandwidth: 1000,
  proximityRange: 10.0,
  
  // 최적화 설정
  enableBatching: true,
  batchSize: 10,
  compressionLevel: 1,
  connectionPoolSize: 50,
  
  // 메시지 설정
  enableChatMessages: true,
  enableActionMessages: true,
  enableStateMessages: true,
  enableSystemMessages: true,
  
  // 신뢰성 설정
  reliableRetryCount: 3,
  reliableTimeout: 5000,
  enableAck: true,
  
  // 그룹 설정
  maxGroupSize: 20,
  autoJoinProximity: true,
  groupMessagePriority: 'normal',
  
  // 디버깅 설정
  enableDebugPanel: false,
  enableVisualizer: false,
  showConnectionLines: false,
  showMessageFlow: false,
  debugUpdateInterval: 500,
  logLevel: 'warn',
  logToConsole: true,
  logToFile: false,
  maxLogEntries: 1000,
  
  // 보안 설정
  enableEncryption: false,
  enableRateLimit: true,
  maxMessagesPerSecond: 100,
  
  // 메모리 관리
  messageGCInterval: 30000,
  connectionTimeout: 30000,
  inactiveNodeCleanup: 60000,

  // 멀티플레이어 전용 설정
  websocket: {
    url: 'ws://localhost:8090',
    reconnectAttempts: 5,
    reconnectDelay: 1000,
    pingInterval: 30000
  },
  tracking: {
    updateRate: 20, // 20Hz (50ms)
    velocityThreshold: 0.5,
    sendRateLimit: 50, // 50ms
    interpolationSpeed: 0.15
  },
  rendering: {
    nameTagHeight: 3.5,
    nameTagSize: 0.5,
    characterScale: 1
  }
}; 