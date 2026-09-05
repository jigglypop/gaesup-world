# Server Contracts API

이 문서는 `gaesup-world/server-contracts` subpath로 공개되는, 클라이언트-서버 권위(authority) 메시지 계약과 플랫폼/운영(ops) 타입을 정리합니다. 이 subpath는 `src/core/content`, `src/core/gameplay`, `src/core/networks/adapter`, `src/core/ops`, `src/core/platform`을 재수출합니다.

## 관련 경로

- `src/core/networks/adapter/contracts.ts` (`GameCommand`, `ServerEvent`, `StateDelta`, `SnapshotAck`)
- `src/core/networks/adapter/authority.ts` (`CommandAuthorityRouter`)
- `src/core/platform/serverHost.ts` (`createServerPluginHost`)
- `src/core/platform/snapshot.ts` (`createWorldSnapshot`, `createPlayerProgress`)
- `src/core/ops/rbac.ts`, `src/core/ops/types.ts`
- `src/core/content/exporter.ts`, `src/core/content/loader.ts`

## 메시지 계약 생성

```ts
import {
  createGameCommand,
  createServerEvent,
  createSnapshotAck,
  createStateDelta,
} from 'gaesup-world/server-contracts';
import type { GameCommand, ServerEvent, SnapshotAck, StateDelta } from 'gaesup-world/server-contracts';
```

`GameCommand<TPayload>`는 `{ version, commandId, domain, action, actorId, submittedAt, payload, targetId?, clientSequence?, expectedRevision?, traceId? }` 형태이며, `ServerEvent<TPayload>`는 `{ version, eventId, domain, type, occurredAt, payload, commandId?, actorId?, serverRevision?, traceId? }` 형태입니다. `createGameCommand`/`createServerEvent`는 각각 `CreateGameCommandOptions`/`CreateServerEventOptions`를 받아 필수 필드(예: `commandId`, `submittedAt`)를 자동 채웁니다.

## Command Authority Router

권위 있는 서버가 들어오는 `GameCommand`를 도메인별 핸들러로 라우팅할 때 사용합니다.

```ts
import {
  createCommandAuthorityRouter,
  createCommandAcceptedResult,
  createCommandRejectedResult,
} from 'gaesup-world/server-contracts';
import type { CommandAuthorityHandler, CommandAuthorityRouter } from 'gaesup-world/server-contracts';

const router: CommandAuthorityRouter = createCommandAuthorityRouter();
router.register('inventory', 'giveItem', async (command, context) => {
  // validate & apply
  return createCommandAcceptedResult(command);
});
```

## Server Plugin Host

일반 클라이언트 플러그인 레지스트리와 동일한 `GaesupPlugin[]`을 서버 측(Node 등)에서 구동하기 위한 호스트입니다.

```ts
import { createServerPluginHost, DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID } from 'gaesup-world/server-contracts';

const host = createServerPluginHost({
  plugins: [/* server-safe GaesupPlugin[] */],
});
await host.setup();
const result = await host.handleCommand(command);
```

`PlatformServerPluginHost`는 `pluginRuntime: 'server'`, `plugins`, `commandAuthority`, `saveSystem?`, `setup()`, `dispose()`, `handleCommand()`, `getService()`/`requireService()`, `getSaveBindings()`, `createWorldSnapshot()` 등을 제공합니다.

## Snapshot / Player Progress

`SaveSystem`에 등록된 도메인 바인딩 중 일부만 골라 월드 스냅샷 또는 플레이어 진행 상태로 직렬화합니다.

```ts
import {
  WORLD_SNAPSHOT_DOMAINS,
  PLAYER_PROGRESS_DOMAINS,
  createWorldSnapshotFromSaveSystem,
  createPlayerProgressFromSaveSystem,
  collectSaveDomains,
  pickDomains,
} from 'gaesup-world/server-contracts';
```

- `WORLD_SNAPSHOT_DOMAINS`: `building`, `scene`, `character`, `assets`, `npc`, `camera`, `time`, `weather`, `audio`
- `PLAYER_PROGRESS_DOMAINS`: `inventory`, `wallet`, `shop`, `relations`, `quests`, `mail`, `catalog`, `crafting`, `farming`, `events`, `town`, `i18n`
- `createWorldSnapshotFromSaveSystem(saveSystem, worldId, options?)` / `createPlayerProgressFromSaveSystem(saveSystem, playerId, options?)`가 `SaveSystem` 인스턴스로부터 바로 스냅샷을 만드는 편의 함수입니다.

## Ops / RBAC

멀티 테넌트 운영(워크스페이스, 역할, 모더레이션 등) 타입과 권한 판정 함수입니다.

```ts
import { canMember, resolveRolePermissions, ROLE_PERMISSIONS } from 'gaesup-world/server-contracts';
import type { WorkspaceMember, RbacPermission, ModerationReport, PublishRecord } from 'gaesup-world/server-contracts';

const allowed = canMember(member, 'content:publish');
```

## Content Bundle (배포/불러오기)

```ts
import {
  createContentBundleFromSaveSystem,
  loadContentBundleFromManifest,
  validateContentBundle,
  validateContentBundleManifest,
  HttpContentBundleSource,
  CONTENT_SCHEMA_VERSION,
} from 'gaesup-world/server-contracts';
import type { ContentBundle, ContentBundleManifest, WorldManifest, AssetManifest, GameplayManifest } from 'gaesup-world/server-contracts';

const bundle = createContentBundleFromSaveSystem(saveSystem, {
  id: 'town-01',
  name: 'Town 01',
  version: '1.0.0',
});
```

`createContentBundleFromSaveSystem`은 `SaveBindingProvider`(= `SaveSystem` 또는 `{ getBindings }` 구현체)와 `ContentBundleExportOptions`(`id`, `name`, `version`, `worldId?`, `worldName?`, `assetVersion?`, `gameplayEvents?`, `npcBehaviorBlueprints?`, `agentBehaviorBlueprints?`)를 받습니다.

## 예제 반영 상태

`examples/`에는 아직 이 subpath를 실제로 사용하는 코드가 없습니다(`examples/packageSurface.ts`에서 타입 전용으로만 import). 서버/운영 도구가 추가되면 `examples/plugins/` 아래에 서버 호스트 샘플을 연결하는 것을 권장합니다.
