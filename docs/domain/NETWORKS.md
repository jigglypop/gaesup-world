# Networks Domain Design

## �� 개요

Networks 도메인은 실시간 멀티플레이어 환경을 구축하기 위한 포괄적인 시스템을 제공합니다. WebSocket을 기반으로 플레이어 간의 상태를 동기화하고, 연결 관리, 데이터 전송 등 멀티플레이어 게임에 필요한 핵심 기능을 담당합니다.

## 🏗️ 아키텍처

### Layer 1: Core Engine
- **PlayerNetworkManager**: WebSocket 연결, 메시지 핸들링 등 서버와의 통신을 담당하는 핵심 클래스입니다.
- **PlayerPositionTracker**: 로컬 플레이어의 위치와 상태를 주기적으로 추적하여 서버로 전송합니다.

### Layer 2: Bridge & State
- **useMultiplayer 훅**: `PlayerNetworkManager`와 `PlayerPositionTracker`를 사용하여 멀티플레이어 로직을 관리하고, 컴포넌트에서 사용할 상태와 함수를 제공하는 중앙 컨트롤러 역할을 합니다.
- **Zustand Stores**: 연결 상태, 플레이어 목록, 오류 메시지 등 UI와 관련된 상태를 관리합니다.

### Layer 3: UI & Hooks
- **ConnectionForm**: 사용자가 서버에 접속하기 위한 정보를 입력하는 UI 컴포넌트입니다.
- **MultiplayerCanvas**: 로컬 및 원격 플레이어들을 3D 월드에 렌더링합니다.
- **PlayerInfoOverlay**: 현재 연결 상태, 플레이어 목록, 접속 해제 버튼 등을 제공하는 UI 오버레이입니다.

## 📁 디렉토리 구조

```
src/core/networks/
├── bridge/                 # 도메인 간 통신 (필요 시 확장)
├── components/
│   ├── ConnectionForm.tsx      # 연결 UI
│   ├── MultiplayerCanvas.tsx   # 3D 렌더링 영역
│   ├── PlayerInfoOverlay.tsx   # 정보 오버레이
│   └── RemotePlayer.tsx        # 원격 플레이어 컴포넌트
├── config/
│   └── default.ts            # 기본 네트워크 설정
├── core/
│   ├── PlayerNetworkManager.ts # WebSocket 통신 관리
│   └── PlayerPositionTracker.ts# 플레이어 상태 추적
├── hooks/
│   ├── useMultiplayer.ts       # 핵심 멀티플레이어 훅
│   └── usePlayerNetwork.ts     # PlayerNetworkManager 래퍼 훅
├── stores/                   # Zustand 상태 관리
├── types/                    # 공통 타입 정의
└── index.ts                  # 도메인 진입점
```

## 🔧 핵심 기능

### 1. 실시간 플레이어 동기화
- **상태 전송**: 로컬 플레이어의 위치, 회전, 애니메이션 상태 등을 실시간으로 서버에 전송합니다.
- **상태 수신**: 서버로부터 다른 플레이어들의 상태를 수신하여 `RemotePlayer` 컴포넌트에 반영합니다.

### 2. 연결 관리
- **연결 UI**: `ConnectionForm` 컴포넌트를 통해 서버 URL, 방 ID, 플레이어 이름을 입력받아 연결을 시작합니다.
- **자동 재연결**: 연결이 끊어졌을 경우를 대비한 로직 (구현 예정).
- **상태 관리**: 연결 중, 연결됨, 연결 끊김, 오류 등 다양한 연결 상태를 관리하고 UI에 피드백을 제공합니다.

### 3. 간편한 사용성
- **`useMultiplayer` 훅**: 단일 훅을 통해 멀티플레이어의 모든 기능을 제어할 수 있습니다.
- **선언적 컴포넌트**: `MultiplayerCanvas`, `PlayerInfoOverlay` 등 직관적인 컴포넌트를 조합하여 멀티플레이어 씬을 구성합니다.

## 📊 타입 정의

### 주요 타입
```typescript
// 플레이어 상태
export interface PlayerState {
  position: [number, number, number];
  rotation: [number, number, number];
  animation: string;
  name: string;
  color: string;
}

// useMultiplayer 훅 반환 타입
export interface UseMultiplayerResult {
  connect: (options: ConnectOptions) => void;
  disconnect: () => void;
  startTracking: (playerRef: React.RefObject<any>) => void;
  stopTracking: () => void;
  players: Map<string, PlayerState>;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  error: string | null;
  isConnected: boolean;
}

// 연결 옵션
export interface ConnectOptions {
  url: string;
  roomId: string;
  playerName: string;
  playerColor: string;
}
```

## 🚀 사용 예제 (`examples/pages/NetworkMultiplayerPage.tsx`)

```tsx
import { useMultiplayer, ConnectionForm, PlayerInfoOverlay, MultiplayerCanvas } from '../../src/core/networks';

export function NetworkMultiplayerPage() {
  const playerRef = useRef<any>(null);
  
  const multiplayer = useMultiplayer({
    config: defaultMultiplayerConfig,
    characterUrl: CHARACTER_URL
  });

  if (!multiplayer.isConnected) {
    return (
      <ConnectionForm
        onConnect={(options) => multiplayer.connect(options)}
        // ...
      />
    );
  }

  return (
    <>
      <MultiplayerCanvas
        players={multiplayer.players}
        playerRef={playerRef}
        // ...
      />
      
      <PlayerInfoOverlay
        state={multiplayer}
        onDisconnect={() => multiplayer.disconnect()}
        // ...
      />
    </>
  );
}
```
1.  **`useMultiplayer`** 훅을 호출하여 멀티플레이어 인스턴스를 가져옵니다.
2.  연결되어 있지 않다면 **`ConnectionForm`** 을 렌더링합니다.
3.  연결되면 **`MultiplayerCanvas`** 와 **`PlayerInfoOverlay`** 를 렌더링합니다.
4.  `connect`, `disconnect` 등의 함수를 호출하여 네트워크 상태를 제어합니다. 