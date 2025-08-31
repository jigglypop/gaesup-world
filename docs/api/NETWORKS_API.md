# Networks API

이 문서는 `networks` 도메인에서 제공하는 API, 컴포넌트 및 훅에 대한 기술 참조입니다.

## 1. Hooks

### `useMultiplayer`

멀티플레이어 기능의 핵심 진입점입니다. `PlayerNetworkManager`와 `PlayerPositionTracker`를 내부적으로 관리하며, 멀티플레이어 세션을 제어하는 데 필요한 모든 상태와 함수를 제공합니다.

-   **위치**: `src/core/networks/hooks/useMultiplayer.ts`

**Props**

| 이름 | 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| `config` | `MultiplayerConfig` | 예 | 서버 URL, 틱레이트 등 네트워크 설정을 담은 객체입니다. |
| `characterUrl` | `string` | 예 | 원격 플레이어를 렌더링할 때 사용할 기본 캐릭터 모델의 URL입니다. |

**반환값 (`UseMultiplayerResult`)**

| 이름 | 타입 | 설명 |
| :--- | :--- | :--- |
| `connect` | `(options: ConnectOptions) => void` | 지정된 옵션으로 WebSocket 서버에 연결을 시작합니다. |
| `disconnect` | `() => void` | 현재 연결을 종료합니다. |
| `startTracking` | `(playerRef: RefObject<any>) => void` | 로컬 플레이어(`playerRef`)의 상태 추적을 시작하여 서버로 전송합니다. |
| `stopTracking` | `() => void` | 로컬 플레이어의 상태 추적을 중지합니다. |
| `players` | `Map<string, PlayerState>` | 현재 방에 있는 모든 원격 플레이어의 ID와 상태를 담은 맵입니다. |
| `connectionStatus` | `'disconnected' \| 'connecting' \| 'connected'` | 현재 WebSocket 연결 상태입니다. |
| `error` | `string \| null` | 연결 또는 통신 중 발생한 오류 메시지입니다. |
| `isConnected` | `boolean` | `connectionStatus`가 `'connected'`인지 여부를 나타내는 편의 상태입니다. |

---

## 2. Components

### `<ConnectionForm />`

사용자가 멀티플레이어 세션에 참여하는 데 필요한 정보를 입력하는 UI 컴포넌트입니다.

-   **위치**: `src/core/networks/components/ConnectionForm.tsx`

**Props**

| 이름 | 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| `onConnect` | `(options: ConnectOptions) => void` | "연결" 버튼 클릭 시 호출되며, 사용자가 입력한 연결 옵션을 인자로 전달합니다. |
| `isConnecting` | `boolean` | 아니요 | 현재 연결 시도 중인지 여부를 나타냅니다. `true`이면 UI가 비활성화됩니다. |
| `error` | `string \| null` | 아니요 | 연결 실패 시 표시할 오류 메시지입니다. |

### `<MultiplayerCanvas />`

로컬 플레이어와 서버로부터 받은 원격 플레이어들을 3D 공간에 렌더링하는 컨테이너 컴포넌트입니다.

-   **위치**: `src/core/networks/components/MultiplayerCanvas.tsx`

**Props**

| 이름 | 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| `players` | `Map<string, PlayerState>` | `useMultiplayer` 훅에서 받은 원격 플레이어 맵입니다. |
| `playerRef` | `RefObject<any>` | 로컬 플레이어의 `ref` 객체입니다. `GaesupController`에 연결된 `ref`를 전달해야 합니다. |
| `config` | `MultiplayerConfig` | 틱레이트 등 렌더링 관련 설정입니다. |
| `characterUrl` | `string` | 플레이어의 기본 캐릭터 모델 URL입니다. |
| `vehicleUrl` | `string` | 아니요 | 플레이어가 탑승할 수 있는 차량 모델 URL입니다. |
| `airplaneUrl` | `string` | 아니요 | 플레이어가 탑승할 수 있는 비행기 모델 URL입니다. |

### `<PlayerInfoOverlay />`

현재 멀티플레이어 상태(연결 상태, 플레이어 목록 등)를 화면에 표시하고, 연결 해제 기능을 제공하는 UI 오버레이입니다.

-   **위치**: `src/core/networks/components/PlayerInfoOverlay.tsx`

**Props**

| 이름 | 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| `state` | `UseMultiplayerResult` | `useMultiplayer` 훅이 반환하는 전체 상태 객체입니다. |
| `playerName` | `string` | 현재 로컬 플레이어의 이름입니다. |
| `onDisconnect` | `() => void` | "연결 해제" 버튼 클릭 시 호출될 콜백 함수입니다. |

### `<RemotePlayer />`

서버로부터 받은 플레이어 데이터를 기반으로 3D 월드에 렌더링되는 원격 플레이어 컴포넌트입니다. 일반적으로 `MultiplayerCanvas` 내부에서 사용됩니다.

-   **위치**: `src/core/networks/components/RemotePlayer.tsx`

**Props**

| 이름 | 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| `playerId` | `string` | 원격 플레이어의 고유 ID입니다. |
| `initialState` | `PlayerState` | 플레이어의 초기 상태(위치, 이름, 색상 등)입니다. |
| `characterUrl` | `string` | 해당 플레이어의 캐릭터 모델 URL입니다. |
| `tickRate` | `number` | 서버로부터의 업데이트 주기에 맞춰 보간을 수행하기 위한 틱레이트입니다. |

## 3. Configuration

### `MultiplayerConfig`

네트워크 도메인의 동작을 설정하는 객체입니다.

-   **위치**: `src/core/networks/config/default.ts`

**Properties**

| 이름 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `url` | `string` | `"ws://localhost:8787"` | 연결할 WebSocket 서버의 주소입니다. |
| `roomId` | `string` | `"gaesup-room"` | 입장할 방의 ID입니다. |
| `tickRate` | `number` | `20` | 초당 서버로 상태를 전송하는 횟수 (Hz)입니다. |
| `maxPlayers` | `number` | `16` | 방에 들어갈 수 있는 최대 플레이어 수입니다. | 