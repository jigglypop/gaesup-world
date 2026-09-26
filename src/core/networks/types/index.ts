import * as THREE from 'three';

export type NetworkPayload = object | string | number | boolean | null | undefined;

// 플레이어 상태 정보
export interface PlayerState {
  name: string;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number, number]; // Quaternion (w, x, y, z)
  animation?: string;
  velocity?: [number, number, number];
  modelUrl?: string;
}

// NPC 네트워크 노드
export interface NPCNetworkNode {
  id: string;
  npcId: string;
  position: THREE.Vector3;
  connections: Set<string>;
  messageQueue: NetworkMessage[];
  lastUpdate: number;
  status: 'active' | 'idle' | 'disconnected';
  communicationRange: number;
  signalStrength: number;
}

// 네트워크 메시지
export interface NetworkMessage {
  id: string;
  from: string;
  to: string | 'broadcast' | 'group';
  type: 'chat' | 'action' | 'state' | 'system';
  payload: NetworkPayload;
  priority: 'low' | 'normal' | 'high' | 'critical';
  timestamp: number;
  reliability: 'unreliable' | 'reliable';
  groupId?: string;
  retryCount?: number;
}

// 연결 정보
export interface NetworkConnection {
  id: string;
  nodeA: string;
  nodeB: string;
  strength: number;
  latency: number;
  bandwidth: number;
  status: 'establishing' | 'active' | 'unstable' | 'disconnected';
  lastActivity: number;
}

// 네트워크 그룹
export interface NetworkGroup {
  id: string;
  type: 'party' | 'proximity' | 'broadcast' | 'guild';
  members: Set<string>;
  maxMembers: number;
  range: number;
  persistent: boolean;
  createdAt: number;
  lastActivity: number;
}

// 네트워크 통계
export interface NetworkStats {
  totalNodes: number;
  activeConnections: number;
  messagesPerSecond: number;
  averageLatency: number;
  bandwidth: number;
  lastUpdate: number;
}

// 네트워크 시스템 상태
export interface NetworkSystemState {
  nodes: Map<string, NPCNetworkNode>;
  connections: Map<string, NetworkConnection>;
  groups: Map<string, NetworkGroup>;
  messageQueues: Map<string, NetworkMessage[]>;
  stats: NetworkStats;
  isRunning: boolean;
  lastUpdate: number;
}

// Bridge Commands
export type NetworkCommand = 
  | {
      type: 'registerNPC';
      npcId: string;
      position: THREE.Vector3;
      options?: {
        communicationRange?: number;
        signalStrength?: number;
      };
    }
  | { type: 'unregisterNPC'; npcId: string }
  | { type: 'updateNPCPosition'; npcId: string; position: THREE.Vector3 }
  | { type: 'connect'; npcId: string; targetId: string }
  | { type: 'disconnect'; npcId: string; targetId?: string }
  | { type: 'sendMessage'; message: NetworkMessage }
  | { type: 'broadcast'; message: Omit<NetworkMessage, 'to'> }
  | { type: 'joinGroup'; npcId: string; groupId: string }
  | { type: 'leaveGroup'; npcId: string; groupId: string }
  | { type: 'createGroup'; group: Omit<NetworkGroup, 'id'> & { id?: string } }
  // Backward-compatible alias (older API used updateConfig/data.config)
  | { type: 'updateConfig'; data: { config: Partial<NetworkConfig> } }
  | { type: 'updateSettings'; settings: Partial<NetworkConfig> }
  | { type: 'startMonitoring'; npcId: string }
  | { type: 'stopMonitoring'; npcId: string };

// Bridge Snapshot
export interface NetworkSnapshot {
  nodeCount: number;
  connectionCount: number;
  activeGroups: number;
  messagesPerSecond: number;
  averageLatency: number;
  lastUpdate: number;
}

// 네트워크 설정
export interface NetworkConfig {
  // 성능 설정
  updateFrequency: number;
  /** @deprecated Has no effect. */
  maxConnections: number;
  messageQueueSize: number;
  
  // 통신 설정
  maxDistance: number;
  /** @deprecated Has no effect. */
  signalStrength: number;
  /** @deprecated Has no effect. */
  bandwidth: number;
  proximityRange: number;
  
  // 최적화 설정
  enableBatching: boolean;
  batchSize: number;
  /** @deprecated Has no effect. WebSocket compression is negotiated by the browser and server (permessage-deflate). */
  compressionLevel: number;
  connectionPoolSize: number;
  
  // 메시지 설정
  /** @deprecated Has no effect. */
  enableChatMessages: boolean;
  /** @deprecated Has no effect. */
  enableActionMessages: boolean;
  /** @deprecated Has no effect. */
  enableStateMessages: boolean;
  /** @deprecated Has no effect. */
  enableSystemMessages: boolean;
  
  // 신뢰성 설정
  reliableRetryCount: number;
  reliableTimeout: number;
  enableAck: boolean;
  
  // 그룹 설정
  /** @deprecated Has no effect. */
  maxGroupSize: number;
  /** @deprecated Has no effect. */
  autoJoinProximity: boolean;
  /** @deprecated Has no effect. */
  groupMessagePriority: 'low' | 'normal' | 'high' | 'critical';
  
  // 디버깅 설정
  /** @deprecated Has no effect. Mount `NetworkDebugPanel` to show it. */
  enableDebugPanel: boolean;
  /** @deprecated Has no effect. Mount `NPCNetworkVisualizer` to show it. */
  enableVisualizer: boolean;
  /** @deprecated Has no effect. Pass `showConnectionLines` to `NPCNetworkVisualizer`. */
  showConnectionLines: boolean;
  /** @deprecated Has no effect. */
  showMessageFlow: boolean;
  debugUpdateInterval: number;
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
  logToConsole: boolean;
  /** @deprecated Has no effect. */
  logToFile: boolean;
  /** @deprecated Has no effect. */
  maxLogEntries: number;
  
  // 보안 설정
  /** @deprecated Has no effect. Use a `wss://` URL for transport encryption. */
  enableEncryption: boolean;
  /** Multiplayer drops PlayerUpdate and Chat messages beyond `maxMessagesPerSecond` from each remote peer. */
  enableRateLimit: boolean;
  /** Per remote peer token-bucket budget used when `enableRateLimit` is on. */
  maxMessagesPerSecond: number;
  
  // 메모리 관리
  /** @deprecated Has no effect. */
  messageGCInterval: number;
  connectionTimeout: number;
  /** @deprecated Has no effect. */
  inactiveNodeCleanup: number;
}

// 플레이어 상태는 이미 위에 정의됨

// 멀티플레이어 설정 (기존 NetworkConfig 확장)
export interface MultiplayerConfig extends NetworkConfig {
  websocket: {
    url: string;
    reconnectAttempts: number;
    reconnectDelay: number;
    pingInterval: number;
  };
  tracking: {
    updateRate: number;
    velocityThreshold: number;
    sendRateLimit: number;
    interpolationSpeed: number;
  };
  rendering: {
    nameTagHeight: number;
    nameTagSize: number;
    characterScale: number;
  };
}

// 멀티플레이어 연결 옵션
export interface MultiplayerConnectionOptions {
  roomId: string;
  playerName: string;
  playerColor: string;
  characterUrl?: string;
}

// 멀티플레이어 상태
export interface MultiplayerState {
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  players: Map<string, PlayerState>;
  localPlayerId: string | null;
  roomId: string | null;
  error: string | null;
  ping: number;
  lastUpdate: number;
} 
