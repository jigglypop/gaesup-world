# 네트워크 API

## 개요

이 문서는 현재 코드 기준으로 네트워크 도메인의 외부 사용 API를 정리합니다.

관련 경로:

- `src/core/networks/index.ts`
- `src/core/networks/hooks/*`
- `src/core/networks/components/*`
- `src/core/networks/types/index.ts`
- `src/core/networks/config/defaultConfig.ts`

## 주요 export

대표적으로 아래 API를 외부에서 자주 사용합니다.

- 훅: `useMultiplayer`, `usePlayerNetwork`, `useNetworkBridge`, `useNetworkMessage`, `useNetworkGroup`, `useNetworkStats`, `useNPCConnection`
- 컴포넌트: `ConnectionForm`, `MultiplayerCanvas`, `PlayerInfoOverlay`, `RemotePlayer`, `NetworkDebugPanel`, `NPCNetworkVisualizer`
- 설정: `defaultMultiplayerConfig`
- 타입: `MultiplayerConfig`, `MultiplayerState`, `PlayerState`, `NetworkConfig`
- 방문 기능: `useVisitRoom`

## 훅 API

### `useMultiplayer(options)`

가장 대표적인 멀티플레이어 훅입니다.

입력:

```ts
type UseMultiplayerOptions = {
  config: MultiplayerConfig;
  characterUrl?: string;
  rigidBodyRef?: RefObject<RapierRigidBody>;
};
```

반환값 성격:

- 연결 제어
- 추적 제어
- 채팅 전송
- 플레이어 목록
- 상태/오류/핑

대표 반환 필드:

- `connect(options)`
- `disconnect()`
- `startTracking(playerRef)`
- `stopTracking()`
- `updateConfig(config)`
- `sendChat(text, options?)`
- `isConnected`
- `connectionStatus`
- `players`
- `localPlayerId`
- `roomId`
- `error`
- `ping`
- `speechByPlayerId`
- `localSpeechText`

### `usePlayerNetwork`

플레이어 네트워크 쪽에 더 직접 가까운 훅입니다.

### `useNetworkBridge`

브리지 기반 네트워크 접근이 필요한 경우 사용하는 훅입니다.

### `useNetworkMessage`

메시지 처리 중심 훅입니다.

### `useNetworkGroup`

그룹 관련 훅입니다.

### `useNetworkStats`

통계 관련 훅입니다.

### `useNPCConnection`

NPC 네트워크 연결 쪽 훅입니다.

### `useVisitRoom`

방문 스냅샷 적용/복원 흐름에 사용하는 훅입니다.

## 컴포넌트 API

### `ConnectionForm`

연결 정보 입력 UI입니다.

props:

- `onConnect(options)`
- `error?: string | null`
- `isConnecting?: boolean`

입력값으로 실제로 받는 정보:

- `roomId`
- `playerName`
- `playerColor`

### `MultiplayerCanvas`

원격 플레이어와 로컬 플레이어를 함께 렌더링하는 3D 캔버스 계층입니다.

주로 아래 정보를 받습니다.

- `players`
- `characterUrl`
- `vehicleUrl`
- `airplaneUrl`
- `playerRef`
- `config`

### `PlayerInfoOverlay`

연결 상태, 플레이어 목록, 채팅, 접속 해제를 제공하는 오버레이입니다.

props:

- `state: MultiplayerState`
- `playerName?: string`
- `onDisconnect: () => void`
- `onSendChat?: (text: string) => void`

### `RemotePlayer`

원격 플레이어 렌더링 컴포넌트입니다.

### `NetworkDebugPanel`

네트워크 디버그 정보 패널입니다.

## 타입 API

### `PlayerState`

원격 또는 로컬 플레이어의 네트워크 상태입니다.

주요 필드:

- `name`
- `color`
- `position`
- `rotation`
- `animation?`
- `velocity?`
- `modelUrl?`

### `MultiplayerConnectionOptions`

연결 시 넘기는 정보입니다.

- `roomId`
- `playerName`
- `playerColor`
- `characterUrl?`

### `MultiplayerState`

훅이 들고 있는 멀티플레이어 상태입니다.

- `isConnected`
- `connectionStatus`
- `players`
- `localPlayerId`
- `roomId`
- `error`
- `ping`
- `lastUpdate`

### `MultiplayerConfig`

멀티플레이어 전체 설정입니다.

- `NetworkConfig` 전체
- `websocket`
- `tracking`
- `rendering`

## 설정 API

### `defaultMultiplayerConfig`

바로 쓸 수 있는 기본 설정 객체입니다.

예:

```tsx
import { defaultMultiplayerConfig, useMultiplayer } from 'gaesup-world';

const multiplayer = useMultiplayer({
  config: defaultMultiplayerConfig,
});
```

## 사용 예시

```tsx
import {
  ConnectionForm,
  MultiplayerCanvas,
  PlayerInfoOverlay,
  defaultMultiplayerConfig,
  useMultiplayer,
} from 'gaesup-world';

export function NetworkPage() {
  const multiplayer = useMultiplayer({
    config: defaultMultiplayerConfig,
  });

  if (!multiplayer.isConnected) {
    return (
      <ConnectionForm
        onConnect={multiplayer.connect}
        error={multiplayer.error}
        isConnecting={multiplayer.connectionStatus === 'connecting'}
      />
    );
  }

  return (
    <>
      <MultiplayerCanvas players={multiplayer.players} config={defaultMultiplayerConfig} />
      <PlayerInfoOverlay
        state={multiplayer}
        onDisconnect={multiplayer.disconnect}
        onSendChat={(text) => multiplayer.sendChat(text)}
      />
    </>
  );
}
```

## 함께 보면 좋은 문서

- [네트워크 도메인 문서](../domain/NETWORKS.md)
- [네트워크 설정 문서](../config/NETWORKS_CONFIG.md)
