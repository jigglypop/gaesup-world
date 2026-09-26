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

/** Settings the multiplayer client reads; `MultiplayerConfig` adds transport, tracking and rendering. */
export interface NetworkConfig {
  /** Default reach of chat messages, in meters; `sendChat` can pass its own range. */
  proximityRange: number;
  /** Resends of an unacknowledged reliable message. */
  reliableRetryCount: number;
  /** Milliseconds to wait for an acknowledgement before resending. */
  reliableTimeout: number;
  enableAck: boolean;
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
  logToConsole: boolean;
  /** Multiplayer drops PlayerUpdate and Chat messages beyond `maxMessagesPerSecond` from each remote peer. */
  enableRateLimit: boolean;
  /** Per remote peer token-bucket budget used when `enableRateLimit` is on. */
  maxMessagesPerSecond: number;
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
