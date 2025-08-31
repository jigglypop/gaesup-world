# Networks Configuration

이 문서는 `networks` 도메인의 동작을 제어하는 설정 객체에 대해 설명합니다.

## `MultiplayerConfig`

`MultiplayerConfig` 객체는 `useMultiplayer` 훅에 전달되어 네트워크 세션의 모든 측면을 제어합니다.

-   **정의 위치**: `src/core/networks/types/index.ts`
-   **기본값 위치**: `src/core/networks/config/default.ts`

### 속성 상세

| 이름 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `url` | `string` | `"ws://localhost:8787"` | 연결할 WebSocket 서버의 주소입니다. 프로덕션 환경에서는 `wss://` 프로토콜을 사용하는 보안 주소로 변경해야 합니다. |
| `roomId` | `string` | `"gaesup-room"` | 입장할 방의 고유 ID입니다. 같은 `roomId`를 가진 플레이어들만 서로를 만날 수 있습니다. |
| `tickRate` | `number` | `20` | 1초에 몇 번 로컬 플레이어의 상태를 서버로 전송할지를 결정합니다 (단위: Hz). 높은 값은 더 부드러운 동기화를 제공하지만 네트워크 사용량이 증가합니다. |
| `maxPlayers` | `number` | `16` | 방에 참여할 수 있는 최대 플레이어 수입니다. 서버 설정과 일치해야 합니다. |
| `timeout` | `number` | `10000` | 서버 연결 시도 시 타임아웃 시간입니다 (단위: ms). |

### 기본 설정 객체

`defaultMultiplayerConfig`는 즉시 테스트 및 사용이 가능하도록 미리 정의된 설정 객체입니다.

```typescript
// src/core/networks/config/default.ts
import { MultiplayerConfig } from '../types';

export const defaultMultiplayerConfig: MultiplayerConfig = {
  url: 'ws://localhost:8787',
  roomId: 'gaesup-room',
  tickRate: 20,
  maxPlayers: 16,
  timeout: 10000,
};
```

## 사용 예제

커스텀 설정을 사용하여 `useMultiplayer` 훅을 초기화하는 방법입니다.

```tsx
import React from 'react';
import { useMultiplayer, MultiplayerConfig } from '../../src/core/networks';

const myCustomConfig: MultiplayerConfig = {
  url: 'wss://my-production-server.com',
  roomId: 'arena-1v1',
  tickRate: 30,
  maxPlayers: 2,
  timeout: 15000,
};

export function MyMultiplayerComponent() {
  const multiplayer = useMultiplayer({
    config: myCustomConfig,
    characterUrl: 'path/to/character.glb',
  });

  // ... 컴포넌트 로직
}
```

## 설정 시 고려사항

-   **`tickRate`**: 플레이어 움직임이 매우 빠른 게임(예: FPS)에서는 `30`~`60`으로 높게 설정하고, 움직임이 적은 게임(예: 소셜 MMO)에서는 `10`~`15`로 낮춰 네트워크 부하를 줄일 수 있습니다.
-   **`url`**: 개발 시에는 로컬 WebSocket 서버 주소(`ws://localhost:...`)를 사용하고, 배포 시에는 반드시 실제 서버의 보안 주소(`wss://...`)로 변경해야 합니다.
-   **`roomId`**: 동적으로 `roomId`를 생성하거나 사용자 입력을 통해 설정하여 여러 개의 독립적인 게임 룸을 운영할 수 있습니다. 