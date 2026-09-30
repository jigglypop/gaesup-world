import { MultiplayerConfig, NetworkConfig } from '../types';

/** Client defaults every multiplayer config starts from. */
export const DEFAULT_NETWORK_CONFIG: Readonly<NetworkConfig> = Object.freeze({
  proximityRange: 10.0,
  reliableRetryCount: 3,
  reliableTimeout: 5000,
  enableAck: true,
  logLevel: 'warn',
  logToConsole: true,
  enableRateLimit: true,
  maxMessagesPerSecond: 100,
});

export const defaultMultiplayerConfig: MultiplayerConfig = {
  ...DEFAULT_NETWORK_CONFIG,

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
