# 네트워크 설정 문서

## 개요

이 문서는 현재 코드 기준으로 네트워크 도메인의 설정 타입과 기본값을 정리합니다.

관련 구현 위치:

- `src/core/networks/types/index.ts`
- `src/core/networks/config/defaultConfig.ts`
- `src/core/networks/hooks/useMultiplayer.ts`

## 설정 타입

네트워크 설정은 두 층으로 나뉩니다.

### 1. `NetworkConfig`

보다 넓은 네트워크 시스템 설정입니다. NPC 네트워크, 메시지 큐, 연결 풀, 디버그 설정까지 포함합니다.

### 2. `MultiplayerConfig`

`NetworkConfig`를 확장한 멀티플레이어 전용 설정입니다.

추가 하위 항목:

- `websocket`
- `tracking`
- `rendering`

실제 `useMultiplayer()`는 이 `MultiplayerConfig`를 받습니다.

## `NetworkConfig` 주요 필드

### 성능 관련

- `updateFrequency`
- `maxConnections`
- `messageQueueSize`

### 통신 관련

- `maxDistance`
- `signalStrength`
- `bandwidth`
- `proximityRange`

### 최적화 관련

- `enableBatching`
- `batchSize`
- `compressionLevel`
- `connectionPoolSize`

### 메시지 종류 제어

- `enableChatMessages`
- `enableActionMessages`
- `enableStateMessages`
- `enableSystemMessages`

### 신뢰성 관련

- `reliableRetryCount`
- `reliableTimeout`
- `enableAck`

### 그룹 관련

- `maxGroupSize`
- `autoJoinProximity`
- `groupMessagePriority`

### 디버그 관련

- `enableDebugPanel`
- `enableVisualizer`
- `showConnectionLines`
- `showMessageFlow`
- `debugUpdateInterval`
- `logLevel`
- `logToConsole`
- `logToFile`
- `maxLogEntries`

### 보안/제한 관련

- `enableEncryption`
- `enableRateLimit`
- `maxMessagesPerSecond`

### 정리/메모리 관련

- `messageGCInterval`
- `connectionTimeout`
- `inactiveNodeCleanup`

## `MultiplayerConfig` 추가 필드

### `websocket`

- `url`
- `reconnectAttempts`
- `reconnectDelay`
- `pingInterval`

### `tracking`

- `updateRate`
- `velocityThreshold`
- `sendRateLimit`
- `interpolationSpeed`

### `rendering`

- `nameTagHeight`
- `nameTagSize`
- `characterScale`

## 현재 기본값

현재 코드의 `defaultMultiplayerConfig`는 아래 경향을 가집니다.

### 네트워크 기본값

- `updateFrequency: 30`
- `maxConnections: 100`
- `messageQueueSize: 1000`
- `maxDistance: 100`
- `proximityRange: 10`
- `enableBatching: true`
- `batchSize: 10`
- `connectionPoolSize: 50`

### 신뢰성/로그 기본값

- `reliableRetryCount: 3`
- `reliableTimeout: 5000`
- `enableAck: true`
- `logLevel: 'warn'`
- `logToConsole: true`

### WebSocket 기본값

- `url: 'ws://localhost:8090'`
- `reconnectAttempts: 5`
- `reconnectDelay: 1000`
- `pingInterval: 30000`

### 추적 기본값

- `updateRate: 20`
- `velocityThreshold: 0.5`
- `sendRateLimit: 50`
- `interpolationSpeed: 0.15`

### 렌더링 기본값

- `nameTagHeight: 3.5`
- `nameTagSize: 0.5`
- `characterScale: 1`

## 사용 예시

```tsx
import { defaultMultiplayerConfig, useMultiplayer } from 'gaesup-world';

const config = {
  ...defaultMultiplayerConfig,
  websocket: {
    ...defaultMultiplayerConfig.websocket,
    url: 'wss://example.com/socket',
  },
  tracking: {
    ...defaultMultiplayerConfig.tracking,
    updateRate: 30,
  },
};

const multiplayer = useMultiplayer({ config });
```

## 설정 시 고려할 점

### 로컬 개발

- `websocket.url`은 `ws://localhost:8090` 형태가 자연스럽습니다.

### 배포 환경

- `wss://` 사용 권장
- `reconnectAttempts`, `reconnectDelay` 조정 필요

### 빠른 액션 게임

- `tracking.updateRate`를 높일 수 있습니다.
- 대신 네트워크 비용과 렌더 보간 부담이 올라갑니다.

### 대규모 세션

- `maxConnections`, `messageQueueSize`, `connectionPoolSize`를 함께 조정해야 합니다.

### 근접 상호작용 중심

- `proximityRange`와 `autoJoinProximity` 조합이 중요합니다.

## 함께 보면 좋은 파일

- `src/core/networks/types/index.ts`
- `src/core/networks/config/defaultConfig.ts`
- `src/core/networks/hooks/useMultiplayer.ts`
- `src/core/networks/core/NetworkSystem.ts`
