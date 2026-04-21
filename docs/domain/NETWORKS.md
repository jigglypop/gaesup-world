# 네트워크 도메인

## 개요

네트워크 도메인은 멀티플레이어 연결, 원격 플레이어 상태 동기화, 메시지 전송, 방문 스냅샷 기능을 담당합니다. 현재 구조는 코어 네트워크 매니저, React 훅, UI 컴포넌트, 방문 동기화 서브도메인으로 나뉘어 있습니다.

핵심 구성:

- 코어: `PlayerNetworkManager`, `PlayerPositionTracker`, `NetworkSystem`, `NPCNetworkManager`, `MessageQueue`, `ConnectionPool`
- 훅: `useMultiplayer`, `usePlayerNetwork`, `useNetworkBridge`, `useNetworkMessage`, `useNetworkGroup`, `useNetworkStats`, `useNPCConnection`
- 컴포넌트: `ConnectionForm`, `MultiplayerCanvas`, `PlayerInfoOverlay`, `RemotePlayer`, `NetworkDebugPanel`
- 방문 기능: `useVisitRoom`, `serializer`, `channel`

## 관련 경로

- `src/core/networks/core/`
- `src/core/networks/hooks/`
- `src/core/networks/components/`
- `src/core/networks/stores/`
- `src/core/networks/visit/`
- `src/core/networks/bridge/`

## 주요 구성 요소

### `PlayerNetworkManager`

플레이어 단위 WebSocket 연결과 메시지 송수신을 담당하는 핵심 매니저입니다.

주요 역할:

- 서버 연결/해제
- 플레이어 입장/퇴장 이벤트 처리
- 플레이어 상태 수신
- 채팅 메시지 수신
- 핑/오류 처리

`useMultiplayer`는 이 매니저를 직접 감싸는 상위 진입점에 가깝습니다.

### `PlayerPositionTracker`

로컬 플레이어 위치를 일정 주기로 읽어 네트워크로 보내는 추적기입니다.

관련 설정:

- `updateRate`
- `velocityThreshold`
- `sendRateLimit`

즉, 무조건 매 프레임 보내는 대신 제한된 빈도로 플레이어 상태를 전송합니다.

### `NetworkSystem`

네트워크 관련 내부 시스템 계층입니다. 플레이어 멀티플레이어뿐 아니라 NPC 네트워크와 메시지 큐, 그룹 관리까지 더 넓은 범위를 다룹니다.

포함되는 기능:

- 메시지 배치 처리
- 근접 기반 그룹 업데이트
- 연결 정리
- 통계 업데이트
- snapshot 생성

### `NPCNetworkManager`

NPC 간 연결, 그룹, 메시지 전송을 관리하는 매니저입니다. 플레이어 멀티플레이어와는 조금 다른 레벨의 네트워크 추상화를 담당합니다.

### `MessageQueue`, `ConnectionPool`

네트워크 부하와 연결 수를 관리하는 유틸리티성 코어 구성 요소입니다.

## 주요 훅

### `useMultiplayer`

멀티플레이어 사용 시 가장 직접적으로 쓰는 훅입니다.

주요 제공:

- `connect(options)`
- `disconnect()`
- `startTracking(playerRef)`
- `stopTracking()`
- `updateConfig(config)`
- `sendChat(text, options?)`
- `players`
- `isConnected`
- `connectionStatus`
- `error`
- `ping`
- `speechByPlayerId`
- `localSpeechText`

즉, UI 입장에서는 이 훅 하나로 대부분의 멀티플레이어 흐름을 다룰 수 있습니다.

### 그 외 훅

- `usePlayerNetwork`
- `useNetworkBridge`
- `useNetworkMessage`
- `useNetworkGroup`
- `useNetworkStats`
- `useNPCConnection`

이 훅들은 좀 더 세분화된 기능이나 디버그/도메인 통합 상황에서 사용됩니다.

## UI 컴포넌트

### `ConnectionForm`

방 ID, 이름, 색상 등 접속 정보를 받아 연결을 시작하는 UI입니다.

### `MultiplayerCanvas`

로컬 플레이어와 원격 플레이어를 월드에 그리는 3D 캔버스 계층입니다.

### `PlayerInfoOverlay`

연결 상태, 채팅, 접속 해제 등 멀티플레이어 HUD 역할을 하는 오버레이입니다.

### `RemotePlayer`

다른 사용자 플레이어를 렌더링하는 컴포넌트입니다.

### `NetworkDebugPanel`

네트워크 상태를 확인하기 위한 디버그 패널입니다.

## 방문 기능

`visit/` 하위 도메인은 월드 상태를 스냅샷 형태로 직렬화/적용하는 기능을 담당합니다.

대표 항목:

- `useVisitRoom`
- `serializer.ts`
- `channel.ts`

즉, 단순 실시간 멀티플레이어 외에 “방문/복제/상태 반영” 같은 별도 흐름도 고려된 구조입니다.

## 동작 흐름

멀티플레이어 기본 흐름은 아래와 같습니다.

1. `useMultiplayer()`를 초기화합니다.
2. `ConnectionForm` 등에서 접속 정보를 받아 `connect()`를 호출합니다.
3. `PlayerNetworkManager`가 서버에 연결합니다.
4. `startTracking()`으로 로컬 플레이어 바디를 연결합니다.
5. `PlayerPositionTracker`가 위치와 상태를 전송합니다.
6. 원격 플레이어 상태가 들어오면 `players` 맵이 갱신됩니다.
7. `MultiplayerCanvas`와 `RemotePlayer`가 이를 렌더링합니다.
8. 필요하면 `sendChat()`으로 근접 채팅도 전송합니다.

## 현재 강점

- 플레이어 멀티플레이어 흐름과 내부 네트워크 시스템이 모두 존재합니다.
- `useMultiplayer` 진입점이 비교적 단순합니다.
- UI 컴포넌트 구성이 이미 준비되어 있어 데모 연결이 쉽습니다.
- 채팅, 핑, 상태 추적까지 포함돼 있어 실제 플레이 흐름을 시험하기 좋습니다.

## 현재 한계

- 플레이어 멀티플레이어와 NPC 네트워크 계층이 함께 있어 구조 파악 난도가 높습니다.
- 일부 내부 시스템은 설계 폭이 넓은 반면, 외부 사용 가이드는 아직 얇은 편입니다.
- strict 타입 기준으로는 일부 방문/네트워크 타입 정리가 남아 있습니다.

## 사용 예시

```tsx
import { ConnectionForm, MultiplayerCanvas, PlayerInfoOverlay, useMultiplayer } from 'gaesup-world';

export function NetworkPage() {
  const multiplayer = useMultiplayer({
    config: defaultMultiplayerConfig,
  });

  if (!multiplayer.isConnected) {
    return <ConnectionForm onConnect={multiplayer.connect} />;
  }

  return (
    <>
      <MultiplayerCanvas players={multiplayer.players} />
      <PlayerInfoOverlay
        state={multiplayer}
        onDisconnect={multiplayer.disconnect}
        onSendChat={(text) => multiplayer.sendChat(text)}
      />
    </>
  );
}
```

## 함께 보면 좋은 파일

- `src/core/networks/hooks/useMultiplayer.ts`
- `src/core/networks/core/PlayerNetworkManager.ts`
- `src/core/networks/core/PlayerPositionTracker.ts`
- `src/core/networks/core/NetworkSystem.ts`
- `src/core/networks/components/ConnectionForm.tsx`
- `src/core/networks/components/MultiplayerCanvas.tsx`
- `src/core/networks/components/PlayerInfoOverlay.tsx`
- `src/core/networks/visit/useVisitRoom.ts`
