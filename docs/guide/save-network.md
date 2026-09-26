# 저장·스냅샷·멀티플레이

도메인 단위 저장 시스템(`SaveSystem`), 런타임의 저장, 자동 저장 hook, 월드·플레이어 스냅샷, 방문 스냅샷, 멀티플레이 클라이언트와 그 WebSocket 프로토콜, 서버 계약 진입점을 다룬다. 월드 상태를 보관하거나 여러 사람이 한 월드에 들어오게 하려는 개발자를 위한 문서다. 저장소에는 멀티플레이 서버가 없으므로 서버가 지켜야 할 규칙도 여기에 적는다. 이름과 기본값은 현재 작업 트리의 소스에서 확인했다.

## 저장 시스템 `SaveSystem`

출처: `src/core/save/core/SaveSystem.ts`, `src/core/save/types.ts`

저장은 **도메인 바인딩**의 모음이다. 도메인(건축, NPC, 시간 등)마다 `key`와 직렬화·복원 함수를 등록하고, 저장하면 모든 도메인을 한 **blob**(`{ version, savedAt, domains: { [key]: data } }`)으로 묶어 **슬롯**(기본 `main`)에 쓴다.

### 도메인 바인딩 `DomainBinding`

| 필드 | 필수 | 설명 |
|---|---|---|
| `key` | 예 | 도메인 이름. 한 시스템에서 유일해야 한다(중복이면 `DuplicateSaveDomainBindingError`) |
| `serialize()` | 예 | 순수 데이터를 돌려준다. 시스템이 복사해 보관한다 |
| `hydrate(data)` | 예 | 복원. `data`는 `null`·`undefined`일 수 있다. 실패한 적용을 되돌릴 때도 불리므로 `serialize()` 결과를 그대로 받아들여야 하고, 자기 도메인만 건드린다 |
| `prepareHydrate(data)` | | 바꾸지 않고 검증만 한 뒤 적용 함수를 돌려준다. 있으면 로드가 모든 도메인을 먼저 검증한다 |
| `revision()` | | `serialize()` 결과가 바뀔 수 있을 때마다 오르는 숫자. 있으면 자동 저장이 바뀐 도메인만 다시 직렬화한다 |
| `reset()` | | 새 세션 상태로. 이 도메인이 없는 저장본을 불러오면 호출된다 |
| `owned` | | `serialize()`가 매번 새 객체를 주면 `true`(복사 생략) |

### API

| 메서드 | 설명 |
|---|---|
| `new SaveSystem({ adapter, defaultSlot?, currentVersion?, migrations?, onDiagnostic? })` | 기본 슬롯 `main`, 버전 1 |
| `register(binding)` | 해제 함수를 돌려준다 |
| `has(key)`, `getBindings()`, `getDefaultSlot()` | |
| `save(slot?, { skipUnchanged? })` | 비동기. `skipUnchanged`면 revision이 그대로인 도메인은 지난 값을 재사용하고, 바뀐 것이 없으면 쓰지 않는다 |
| `load(slot?, signal?)` | 비동기. 저장본이 없거나 취소·추월되면 `false` |
| `createBlob(slot?)` / `hydrateBlob(blob, slot?)` | 저장소 없이 blob을 만들고 적용(동기) |
| `list()`, `remove(slot?)` | 슬롯 목록·삭제 |
| `registerRestoreGuard(guard)` | 복원 중에 멈춰야 할 효과(애니메이션, 소리 등) 경계. 검증이 끝난 뒤 들어가고 적용·롤백 뒤 풀린다 |
| `subscribeDiagnostics(listener)` | 도메인별 직렬화·복원 실패 보고 |
| `isRestoring()`, `isLoading()`, `cancelPendingLoads()` | |

### 불러오기 규칙

1. 봉투(`savedAt`, `domains`)와 버전을 검사하고, 옛 버전이면 `migrations[버전]`을 차례로 적용한다. 각 마이그레이션은 버전을 올려야 한다.
2. 등록된 **모든** 도메인을 먼저 준비한다(`prepareHydrate` 또는 적용 예약). 하나라도 검증에 실패하면 아무것도 바꾸지 않고 `AggregateError`를 던진다.
3. 저장본에 없는 도메인은 `reset()`이 있으면 초기화된다(이전 슬롯 상태가 남지 않게).
4. 현재 상태를 스냅샷으로 떠 두고, 복원 경계에 들어간 뒤 도메인을 차례로 적용한다. 적용 중 실패하면 이미 적용한 도메인(실패한 것 포함)을 역순으로 되돌리고 던진다.
5. 같은 슬롯의 쓰기·삭제는 순서대로 처리되고, 로드는 앞선 쓰기를 기다린다.

### 어댑터

| 어댑터 | 저장 위치 |
|---|---|
| `IndexedDBAdapter` | DB `gaesup-save`, 오브젝트 스토어 `slots`, 키는 슬롯 이름 |
| `LocalStorageAdapter` | `localStorage`의 `gaesup:save:<slot>`(JSON) |
| `NamespacedSaveAdapter(adapter, namespace)` | 슬롯 이름 앞에 `world:<encodeURIComponent(namespace)>:`를 붙여 월드별로 나눈다 |

직접 만들려면 `{ read(slot), write(slot, blob), list(), remove(slot) }`(모두 Promise)를 구현한다. `createDefaultSaveSystem({ namespace? })`는 IndexedDB가 있으면 IndexedDB, 없으면 localStorage를 쓰고 `namespace`가 있으면 감싼다. `getSaveSystem()`은 namespace 없는 전역 싱글턴이다(legacy).

## 런타임의 저장 `runtime.save`

`createGaesupRuntime()`이 월드마다 저장 시스템을 만든다(`src/core/runtime/createGaesupRuntime.ts`).

- 기본은 `createDefaultSaveSystem({ namespace: worldId })`다. **`worldId`를 주지 않으면 매번 새 id가 만들어져 새로고침 뒤 이전 저장을 찾지 못한다.** 영속 월드는 `createGaesupRuntime({ worldId: 'my-village' })`처럼 고정한다.
- `saveSystem`을 주면 그것을, `saveOptions`를 주면 `new SaveSystem(saveOptions)`를 쓴다(이때는 namespace가 붙지 않는다).
- 등록되는 바인딩: `saveBindings` 옵션, 플러그인이 `ctx.save`에 등록한 바인딩, 그리고 규칙 엔진 상태 `gameplay-events`(항상). 같은 key는 먼저 등록된 것이 남는다. `setup()` 뒤에 플러그인이 같은 key를 등록하면 거부되고 `RUNTIME_SAVE_BINDING_REJECTED_EVENT`가 발행된다.
- **플러그인을 넣지 않으면 건축·NPC 등은 저장되지 않는다.** 엔진 도메인 플러그인과 저장 key:

| 플러그인 | key |
|---|---|
| `buildingPlugin` / `createBuildingPlugin()` | `building` |
| `npcPlugin` / `createNPCPlugin()` | `npc`(시뮬레이션 자세 포함) |
| `cameraPlugin` / `createCameraPlugin()` | `camera`(모드와 카메라 옵션) |
| `timePlugin`, `weatherPlugin`, `characterPlugin`, `audioPlugin`, `scenePlugin`, `i18nPlugin` | `time`, `weather`, `character`, `audio`, `scene`, `i18n` |
| `createAvatarPlugin()`(`gaesup-world/avatar`) | `avatar` |

- 복원하는 동안 런타임이 NPC 시뮬레이션, 시네마틱, 장면 전환, 효과음, 규칙 엔진을 멈췄다가 다시 켠다.

```tsx
import { buildingPlugin, createGaesupRuntime, npcPlugin, timePlugin, useAutoSave, useLoadOnMount } from 'gaesup-world';

const runtime = createGaesupRuntime({ worldId: 'my-village', plugins: [buildingPlugin, npcPlugin, timePlugin] });
await runtime.setup();

function Persistence() {
  useLoadOnMount('main', (loaded) => { if (!loaded) seedFirstVillage(); });
  useAutoSave({ intervalMs: 60_000 });
  return null;
}
// <GaesupWorld runtime={runtime} ...><Persistence />...</GaesupWorld>

await runtime.save.save();          // 기본 슬롯 main
await runtime.save.load('main');
```

## 자동 저장 hook

출처: `src/core/save/hooks/useAutoSave.ts`, `src/core/save/core/saveHookCoordinator.ts`

| hook | 설명 |
|---|---|
| `useAutoSave({ enabled = true, intervalMs = 300000, slot?, saveOnUnload = true, saveOnVisibilityChange = true, saveSystem? })` | 주기(최소 1초), 페이지 숨김, `beforeunload` 때 `save(slot, { skipUnchanged: true })` |
| `useLoadOnMount(slot?, onLoaded?, saveSystem?)` | 마운트 때 한 번 불러온다. 결과를 `onLoaded(loaded)`로 알리고, 늦게 마운트된 소비자는 다시 불러오지 않고 결과만 받는다 |

- 저장 시스템은 `saveSystem` 인자 → 가장 가까운 런타임의 `runtime.save` → `getSaveSystem()` 순으로 고른다. 런타임 월드에서는 런타임이 활성일 때만 동작한다.
- 같은 시스템·슬롯의 hook들은 쓰기 루프 하나를 나눠 쓰고, 가장 짧은 주기가 이긴다. 저장이 진행 중이면 다음 요청은 합쳐진다.
- 같은 슬롯에 `useLoadOnMount`가 있으면 첫 로드가 끝날 때까지 자동 저장하지 않는다(저장본이 없어 `false`로 끝나도 끝난 것이다). 로드가 예외로 실패하면 그 소비자들이 남아 있는 동안 자동 저장이 멈춰 있다(손상된 저장본을 덮어쓰지 않도록).
- 로딩·복원 중과 `suspendAutoSave()`로 멈춘 동안에도 쓰지 않는다. `suspendAutoSave()`는 해제 함수를 돌려주고 전역 카운터로 동작한다(`isAutoSaveSuspended()`).

## 진단

- `runtime.saveDiagnostics`: `report`, `getDiagnostics()`, `getLatest()`, `clear()`, `subscribe(listener)`. 기록은 `{ phase: 'serialize' | 'hydrate', operation?: 'rollback', key, slot, error, id, reportedAt, errorMessage, message }`이고 최근 50개를 보관한다(`createGaesupRuntime({ saveDiagnostics: { maxEntries } })`로 바꾼다).
- 같은 기록이 플러그인 이벤트 `RUNTIME_SAVE_DIAGNOSTIC_EVENT`로도 나간다.
- `<RuntimeSaveDiagnosticsToaster />`는 새 진단을 토스트로 띄운다(`<ToastHost />` 필요). props: `enabled`, `includeExisting`, `durationMs`(6500), `kind`, `icon`, `formatMessage`.
- `formatRuntimeSaveDiagnostic(diagnostic)`는 사람이 읽는 한 줄을 만든다.

## 게임 도메인 추가

게임 고유 상태(소지품, 진행도 등)는 엔진에 없으므로 게임이 도메인을 등록한다. `serialize`·`hydrate`를 가진 zustand store라면 `createStoreDomainPlugin`이 바인딩·서비스·초기화(`reset`)·revision을 한 번에 만든다.

```ts
import { create } from 'zustand';
import { createStoreDomainPlugin } from 'gaesup-world/plugins';

type Progress = { unlocked: string[] };
type ProgressState = Progress & { serialize: () => Progress; hydrate: (data: Progress | null | undefined) => void };

const useProgress = create<ProgressState>()((set, get) => ({
  unlocked: [],
  serialize: () => ({ unlocked: [...get().unlocked] }),
  hydrate: (data) => set({ unlocked: data?.unlocked ?? [] }),
}));

export const progressPlugin = createStoreDomainPlugin<Progress, typeof useProgress>({
  id: 'my-game.progress', name: 'Progress', saveExtensionId: 'progress', storeServiceId: 'progress.store',
  store: useProgress, readyEvent: 'progress:ready',
});
// createGaesupRuntime({ plugins: [progressPlugin, ...] })
```

타입 인자(`<Progress, typeof useProgress>`)를 생략하면 직렬화 타입이 넓게 추론되어 `hydrate` 타입이 맞지 않는다.

런타임 없이 쓰는 월드는 `getSaveSystem().register({ key, serialize, hydrate })`로 직접 등록한다.

## 플랫폼 스냅샷

월드 상태와 플레이어 상태를 나눠 서버·다른 월드로 옮기는 형식이다(`src/core/platform/snapshot.ts`).

| 상수 | 값 |
|---|---|
| `WORLD_SNAPSHOT_DOMAINS` | `building`, `scene`, `scene-document`, `character`, `assets`, `npc`, `camera`, `time`, `weather`, `audio` |
| `PLAYER_PROGRESS_DOMAINS` | `i18n` |

| 함수 | 결과 |
|---|---|
| `createWorldSnapshot(worldId, domains, { version?, savedAt? })` | `{ kind: 'world', worldId, version, savedAt, domains }`. `domains`에서 월드 도메인만 고른다 |
| `createWorldSnapshotFromSaveSystem(provider, worldId, options?)` | `provider.getBindings()`(보통 `runtime.save`)에서 월드 도메인만 직렬화 |
| `createPlayerProgress(playerId, domains, { worldId?, version?, savedAt?, domains? })` | `{ kind: 'player', playerId, worldId?, ... }` |
| `createPlayerProgressFromSaveSystem(provider, playerId, options?)` | 플레이어 도메인만 직렬화 |
| `collectSaveDomains(provider)`, `pickDomains(domains, allowed)` | 모든 도메인 직렬화, 허용 목록으로 거르기 |

엔진의 플레이어 도메인은 `i18n` 하나다. 게임이 자기 플레이어 도메인(예: 소지품)을 등록했다면 `domains` 옵션으로 넘긴다: `createPlayerProgressFromSaveSystem(runtime.save, 'player-1', { domains: ['i18n', 'inventory'] })`.

스냅샷을 `hydrateBlob`으로 적용하면 스냅샷에 없는 도메인은 `reset()`된다(위 불러오기 규칙 3). 일부 도메인만 덮으려면 아래 `applyVisitSnapshot`처럼 도메인별로 적용한다.

## 방문 스냅샷

다른 플레이어의 월드를 잠시 내 화면에 불러오는 기능이다(`src/core/networks/visit/*`, 진입점 `gaesup-world/network`).

| API | 설명 |
|---|---|
| `serializeVisit(provider, { hostId, hostName?, worldId?, domains?, version?, savedAt? })` | 바인딩에서 방문 스냅샷을 만든다. 기본 도메인 `DEFAULT_VISIT_DOMAINS`(= `WORLD_SNAPSHOT_DOMAINS`) |
| `applyVisitSnapshot(provider, snapshot, { allowedDomains?, filter?, atomic? })` | `{ applied, skipped }`. 버전이 1이 아니면 모두 건너뛴다 |
| `captureVisitRestorePoint(provider, keys?)` | 적용 전 로컬 상태를 떠 두고 `restore()`로 되돌린다 |
| `visitProviderFromSaveSystem(saveSystem)` | `SaveSystem`을 바인딩 제공자(`() => Iterable<DomainBinding>`)로 |
| `createLocalVisitChannel()` | 같은 탭 안의 채널(테스트·데모) |
| `createWebSocketVisitChannel({ send, onMessage })` | 텍스트 전송 위의 채널 |
| `useVisitRoom(options)` | 채널·바인딩을 묶은 hook |

- 비원자 적용(기본)은 도메인마다 `hydrate`를 부르고, 예외가 난 도메인은 `skipped`에 넣고 계속한다.
- `atomic: true`는 모든 도메인을 먼저 준비(`prepareHydrate`, 없으면 적용 예약)하고, 하나라도 준비에 실패하면 아무것도 적용하지 않는다(`applied: []`). **그러나 적용 단계에서 중간 도메인이 실패하면 이미 적용한 도메인을 되돌리지 않는다.** 실패한 도메인만 `skipped`에 들어간다(PRD ISO-2에서 고칠 예정). `prepareHydrate`가 없는 도메인은 사전 검증도 되지 않는다.
- 와이어 형식: `{ type: 'VisitSnapshot', v: 1, snapshot }`, `{ type: 'VisitLeave', v: 1, hostId }`. 문자열 길이가 5×1024×1024를 넘거나 도메인이 64개를 넘거나 형식이 틀리면 버린다. `onMessage` 콜백에 중계 서버가 인증한 발신자 id(`senderId`)를 넘기면 방 주인이 아닌 발신자의 스냅샷·퇴장을 무시한다. 넘기지 않으면 주인과 사칭을 구분하지 못한다.

`useVisitRoom({ hostId, hostName?, channel, bindings, hostMode = true, autoApply = false, allowedDomains?, isolateLocalWorld = true })`는 `{ remoteSnapshot, lastPublished, publishNow(), acceptRemote(), dismissRemote(), announceLeave(), leaveVisit() }`를 준다. `isolateLocalWorld`면 처음 원격 스냅샷을 적용하기 전에 로컬 상태를 떠 두고 자동 저장을 멈췄다가, `leaveVisit()`이나 주인의 퇴장 때 되돌리고 자동 저장을 푼다. 적용은 항상 `atomic: true`다.

```ts
const visit = useVisitRoom({ hostId: me.id, channel, bindings: visitProviderFromSaveSystem(runtime.save) });
visit.publishNow();          // 내 월드를 보낸다
visit.acceptRemote();        // 받은 월드를 적용한다
visit.leaveVisit();          // 내 월드로 돌아온다
```

## 멀티플레이 클라이언트

출처: `src/core/networks/hooks/useMultiplayer.ts`, `src/core/networks/core/PlayerNetworkManager.ts`, `src/core/networks/components/*`. 진입점 `gaesup-world/network`(루트에도 있다).

### 설정 `MultiplayerConfig`

`NetworkConfig` 8개 필드 + `websocket`·`tracking`·`rendering`. 기본값은 `defaultMultiplayerConfig`, 앞의 8개만 모은 동결 객체는 `DEFAULT_NETWORK_CONFIG`다.

| 필드 | 기본값 | 설명 |
|---|---|---|
| `proximityRange` | 10 | `sendChat`의 기본 도달 거리(m). 서버에 `range`로 보낸다 |
| `reliableRetryCount`, `reliableTimeout` | 3, 5000ms | Ack를 못 받은 채팅 재전송 횟수·간격 |
| `enableAck` | `true` | 채팅에 `ackId`를 붙이고 Ack를 기다린다 |
| `logLevel`, `logToConsole` | `'warn'`, `true` | |
| `enableRateLimit`, `maxMessagesPerSecond` | `true`, 100 | 원격 사람마다 PlayerUpdate·Chat을 초당 이 수로 제한(토큰 버킷) |
| `websocket` | `{ url: 'ws://localhost:8090', reconnectAttempts: 5, reconnectDelay: 1000, pingInterval: 30000 }` | |
| `tracking` | `{ updateRate: 20, velocityThreshold: 0.5, sendRateLimit: 50, interpolationSpeed: 0.15 }` | 전송 Hz, 달리기 판정 속도, 전송 최소 간격(ms), 원격 보간 |
| `rendering` | `{ nameTagHeight: 3.5, nameTagSize: 0.5, characterScale: 1 }` | 원격 아바타 표시 |

### `useMultiplayer({ config, characterUrl?, rigidBodyRef? })`

| 결과 | 설명 |
|---|---|
| `isConnected`, `connectionStatus`, `localPlayerId`, `roomId`, `error`, `ping`, `lastUpdate` | 연결 상태(`'disconnected' \| 'connecting' \| 'connected' \| 'error'`) |
| `players` | 원격 플레이어 `Map<id, PlayerState>`. 들어오고 나갈 때만 새 객체가 되고, 위치 갱신은 제자리에서 바뀐다(`players.subscribePlayer(id, listener)`로 한 사람만 구독) |
| `connect({ roomId, playerName, playerColor })` | 연결. 옵션의 `characterUrl`은 쓰이지 않고 hook의 `characterUrl`이 `modelUrl`로 전송된다 |
| `disconnect()` | `Leave`를 보내고 닫는다 |
| `startTracking(ref)`, `stopTracking()` | 내 몸체 위치 전송 시작·중지(`rigidBodyRef`를 주면 연결 때 자동) |
| `updateConfig(partial)` | 다음 연결부터 적용. `tracking`은 즉시 |
| `sendChat(text, { range?, ttlMs? })` | 채팅(최대 200자). 내 말풍선을 `ttlMs`(2.5초) 동안 |
| `speechByPlayerId`, `localSpeechText` | 말풍선 텍스트(원격은 받은 뒤 2.5초) |

- 위치는 `setInterval`로 `updateRate`마다 샘플하고, 1cm·약 0.1°·5cm/s를 넘게 바뀌었거나 애니메이션·이름이 바뀌었을 때, 또는 1초마다 보낸다. 움직일 때 회전은 이동 방향으로 만든 yaw 쿼터니언이다. 애니메이션 이름은 월드 store의 현재 애니메이션(`animationState[mode.type].current`)을 보낸다.
- 채팅 범위 필터는 서버 몫이다. 클라이언트는 받은 채팅을 모두 말풍선으로 띄운다.

```tsx
import type { RapierRigidBody } from '@react-three/rapier';
import { GaesupController } from 'gaesup-world';
import { ConnectionForm, PlayerInfoOverlay, RemotePlayer, defaultMultiplayerConfig, useMultiplayer } from 'gaesup-world/network';

type LivePlayers = ReturnType<typeof useMultiplayer>['players'];

function LiveRemote({ id, players, speech }: { id: string; players: LivePlayers; speech: string }) {
  const state = useSyncExternalStore((onChange) => players.subscribePlayer(id, onChange), () => players.get(id));
  return state ? <RemotePlayer playerId={id} state={state} config={defaultMultiplayerConfig} speechText={speech} /> : null;
}

function Room() {
  const playerRef = useRef<RapierRigidBody>(null!);
  const mp = useMultiplayer({ config: defaultMultiplayerConfig, characterUrl: PLAYER_URL, rigidBodyRef: playerRef });
  return (
    <GaesupWorld urls={{ characterUrl: PLAYER_URL }} cameraOption={CAMERA}>
      {!mp.isConnected && <ConnectionForm onConnect={mp.connect} error={mp.error} isConnecting={mp.connectionStatus === 'connecting'} />}
      <PlayerInfoOverlay state={mp} onDisconnect={mp.disconnect} onSendChat={(text) => mp.sendChat(text)} />
      <Canvas gl={createRenderer}>
        <Suspense fallback={null}>
          <GaesupWorldContent>
            <WorldPhysics>
              <GaesupController rigidBodyRef={playerRef} position={[0, 2, 0]} />
              {[...mp.players.keys()].map((id) => (
                <LiveRemote key={id} id={id} players={mp.players} speech={mp.speechByPlayerId.get(id) ?? ''} />
              ))}
            </WorldPhysics>
          </GaesupWorldContent>
        </Suspense>
      </Canvas>
    </GaesupWorld>
  );
}
```

- `RemotePlayer` props: `playerId`, `state`, `characterUrl?`(주면 모든 원격 아바타가 이 모델), `config?`, `speechText?`, `allowedModelOrigins?`. 원격 사람이 보낸 `modelUrl`은 http(s)이고 2048자 이하이며, 이 페이지와 같은 출처이거나 `allowedModelOrigins`(출처 또는 출처+디렉터리, 예: `https://cdn.example.com/models/`) 아래일 때만 불러오고, 실패해도 월드를 멈추지 않는다. 키네마틱 캡슐을 쓰므로 `WorldPhysics` 안에 둔다. 이름표는 drei `Text`(WebGL 헬퍼)로 그린다.
- `RemotePlayer`는 `state` prop이 바뀔 때만 목표를 받는다. 위처럼 한 사람씩 구독하지 않고 `players`를 그대로 map하면 부모가 위치 갱신 때 다시 그려지지 않아(상태 갱신은 약 0.25초에 한 번) 움직임이 끊긴다. 한 사람씩 구독하는 내부 `RemotePlayers`는 공개 export가 아니다.
- `ConnectionForm`(`onConnect`, `error?`, `isConnecting?`), `PlayerInfoOverlay`(`state`, `playerName?`, `onDisconnect`, `onSendChat?`)는 DOM이다.
- `usePlayerNetwork({ url, roomId, playerName, playerColor })`는 추적 없이 연결·플레이어 목록·`updateLocalPlayer(state)`만 주는 가벼운 hook이다.
- `PlayerNetworkManager`를 직접 쓰면 `acceptModelUrl`(원격 모델 URL 허용 함수), `offlineQueueSize`(끊긴 동안 쌓을 채팅 수, 기본 50), `onReliableFailed` 등 hook이 노출하지 않는 옵션도 쓸 수 있다.
- `MultiplayerCanvas`는 데모용 완성 캔버스다. `createRenderer`를 쓰지 않아 WebGL 렌더러로 그리고, drei `Environment` 프리셋과 격자 바닥을 깐다.

### 연결 동작

- 열리면 곧바로 `Join`을 보내고, 보류 중인 신뢰 메시지를 다시 보낸 뒤 끊긴 동안 쌓인 채팅과 마지막 위치를 보낸다.
- 정상 종료(1000, 1001)가 아니면 `reconnectDelay × 2^n`(최대 30초, 0.5~1배 지터)으로 `reconnectAttempts`번 다시 연결한다. 재연결하는 동안 원격 플레이어를 최대 10초 남겨 두고, 다음 `Welcome`의 방 상태로 맞춘다.
- `pingInterval`마다 `Ping`을 보낸다. 서버가 한 번이라도 `Pong`에 답한 뒤, 다음 핑 때까지 답이 없으면 반쯤 끊긴 연결로 보고 닫고(코드 4000) 다시 연결한다.

## WebSocket 프로토콜

모든 메시지는 JSON 텍스트다. 클라이언트가 보내는 것:

| type | 필드 | 언제 |
|---|---|---|
| `Join` | `room_id`, `name`, `color`, `modelUrl?` | 연결될 때마다 |
| `Update` | `state: Partial<PlayerState>` | 위치 추적. `name`·`color`·`modelUrl`·`animation`은 이 연결에서 바뀔 때만 들어 있다 |
| `Chat` | `text`, `range?`, `ackId?` | `sendChat`. `enableAck`면 `ackId` |
| `Ping` | `ts` | `pingInterval`마다 |
| `Leave` | 없음 | `disconnect()` |

서버가 보내야 하는 것(클라이언트가 검증한다):

| type | 필드 | 뜻 |
|---|---|---|
| `Welcome` | `client_id`, `room_state?: { [id]: PlayerState }` | `Join`에 대한 답. 내 id와 방에 있는 사람들 |
| `PlayerJoined` | `client_id`, `state: PlayerState` | 다른 사람 입장 |
| `PlayerUpdate` | `client_id`, `state: Partial<PlayerState>` | 다른 사람 상태 변화(모르는 id면 입장으로 처리) |
| `PlayerLeft` | `client_id` | 퇴장 |
| `Chat` | `client_id`, `text`, `timestamp` | 채팅 |
| `Pong` | `ts?` | `Ping`의 `ts`를 그대로 돌려주면 왕복 시간을 잰다 |
| `Ack` | `ackId` | 신뢰 메시지 수신 확인 |

`PlayerState`: `{ name, color, position: [x, y, z], rotation: [w, x, y, z], animation?, velocity?: [x, y, z], modelUrl? }`. 회전은 **w가 앞에 오는** 쿼터니언이다.

검증 규칙: `Ack`·`Pong`을 뺀 메시지는 비어 있지 않은 `client_id`가 있어야 한다. `Welcome.room_state`와 `PlayerJoined.state`는 `name`·`color`·`position`·`rotation`이 모두 있어야 한다(하나라도 틀리면 그 메시지 전체를 버린다). 좌표는 각 성분 절댓값 100,000 이하, 회전은 0이 아닌 4성분이어야 한다. 한 메시지는 5×1024×1024 이하(텍스트는 글자 수, 바이너리는 바이트)여야 하고, 이름·색·애니메이션은 64자, 채팅은 200자로 자르며, 원격 사람마다 채팅은 초당 4개로 제한된다. **모르는 `type`은 무시되지 않고 형식 오류로 `onError`에 보고된다.**

## 서버가 해야 할 일

저장소에는 이 프로토콜을 받는 서버가 없다(`websocket.url` 기본값 `ws://localhost:8090`만 있다). 서버를 만들면 다음을 지킨다.

1. `Join`을 받으면 연결에 `client_id`를 주고 `room_id` 방에 넣는다. 그 연결에 `Welcome { client_id, room_state }`(방의 다른 사람 전체 상태)를 보내고, 방의 다른 사람에게 `PlayerJoined`를 보낸다. 클라이언트는 재연결 때마다 `Join`을 다시 보낸다.
2. `Update`를 받으면 그 사람의 마지막 전체 상태에 합쳐 두고(다음 `Welcome`에 쓴다), 방의 다른 사람에게 `PlayerUpdate { client_id, state }`로 보낸다. 부분 상태이므로 합친 결과가 필요하다.
3. `Chat`을 받으면 `range`와 보낸 사람 위치로 받을 사람을 고르고(근접 채팅) `Chat { client_id, text, timestamp }`를 보낸다. `ackId`가 있으면 보낸 사람에게 `Ack { ackId }`를 돌려준다. **Ack를 돌려주지 않으면 `enableAck` 기본값 때문에 같은 채팅이 5초 간격으로 3번 더 온다.** `ackId`로 중복을 거른다.
4. `Ping { ts }`에는 `Pong { ts }`로 답한다.
5. `Leave`나 소켓 종료 때 방에 `PlayerLeft`를 보낸다.
6. 위 검증 규칙을 넘는 메시지를 보내지 않는다. 원격 `modelUrl`을 쓸 거라면 출처를 서버에서도 제한한다.
7. 방문 스냅샷을 같은 서버로 중계한다면 `VisitSnapshot`/`VisitLeave`는 플레이어 소켓과 다른 채널로 보내거나(모르는 type은 오류로 보고된다), 중계할 때 인증한 발신자 id를 함께 넘긴다.

## 서버 계약 `gaesup-world/server-contracts`

Node 서버에서 쓸 수 있도록 React·Zustand·React Three를 끌어오지 않게 검사되는 진입점이다(`scripts/check-entry-isolation.cjs`, `pnpm run check:entries`). 콘텐츠 번들, 규칙 엔진(클라이언트 서비스 없는 판), 네트워크 계약, 플랫폼 스냅샷을 담는다.

- **명령 권한 라우터** `createCommandAuthorityRouter({ now?, createId?, verifyActor?, getRevision?, replayWindowMs?, maxReplayEntries?, onHandlerError? })`: `register({ domain, action? | '*' }, handler)`로 처리기를 달고 `handle(command, session?)`으로 실행한다. 명령 형식을 검사하고, 세션이 있으면 `session.actorId`와 명령의 `actorId`가 같아야 한다(`verifyActor`로 바꿈). 같은 `actorId:commandId`의 **수락된** 결과는 60초 동안 재사용되고(거절은 다시 시도 가능), 같은 도메인의 명령은 순서대로 처리된다. `expectedRevision`과 `getRevision`이 다르면 거절한다. 처리기 예외는 일반 거절 사유로 바뀐다.
- 명령·결과 만들기: `createGameCommand({ domain, action, actorId, payload, ... })`, `createCommandAcceptedResult(command, { events?, deltas?, serverRevision? })`, `createCommandRejectedResult(command, reason, ...)`, `createServerEvent`, `createStateDelta`, `createSnapshotAck`, `createNetworkEnvelope`.
- **서버 플러그인 호스트** `createServerPluginHost({ plugins?, saveSystem?, saveBindings?, commandAuthority?, logger? })`: `runtime`이 `'server'` 또는 `'both'`인 플러그인만 올리고, 라우터를 서비스 `DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID`(`server.commandAuthority`)로 등록해 플러그인이 처리기를 달게 한다. `setup()`, `dispose()`, `handleCommand(command, session?)`, `getService`·`requireService`, `getSaveBindings()`, `createWorldSnapshot(worldId, options?)`, `createPlayerProgress(playerId, options?)`를 준다. `saveSystem`을 주지 않으면 `saveBindings`와 플러그인의 저장 바인딩은 경고와 함께 무시되고 스냅샷의 `domains`는 비어 있다.
- 멀티플레이 클라이언트(`useMultiplayer`)는 이 명령 계약을 쓰지 않는다. 둘은 아직 연결되어 있지 않다.

## 알려진 제한

- 멀티플레이 서버가 저장소에 없다.
- 방문 스냅샷의 원자적 적용이 중간 실패를 되돌리지 않는다(PRD ISO-2).
- `worldId` 없이 만든 런타임의 기본 저장은 새로고침 뒤 찾을 수 없다.
- 도메인 플러그인을 넣지 않은 런타임은 규칙 엔진 상태만 저장한다.
- 공개 `RemotePlayer`로 원격 아바타를 부드럽게 움직이려면 한 사람씩 구독해야 한다.
- 클라이언트는 채팅 범위를 거르지 않고, 모르는 메시지 type을 오류로 보고한다.
- `MultiplayerCanvas`와 원격 이름표는 WebGL 경로를 쓴다(PRD GPU-1). 전송은 WebSocket뿐이다.
- `PlayerNetworkManager`는 연결·재연결·핑·속도 제한·신뢰 전송·채팅 큐를 한 파일(1,006줄)에 담고 있다.

## 관련 문서

- [getting-started.md](getting-started.md) · [world-runtime.md](world-runtime.md) · [rendering.md](rendering.md)
- [character-camera-input.md](character-camera-input.md) · [building.md](building.md) · [npc-dialog-gameplay.md](npc-dialog-gameplay.md)
- [performance.md](performance.md) · [api-map.md](api-map.md)
- [../dev/architecture.md](../dev/architecture.md) · [../dev/module-status.md](../dev/module-status.md)
