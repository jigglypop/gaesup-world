# 엔진 아키텍처

엔진이 어떻게 맞물려 도는지 설명한다. 월드 하나를 소유하는 런타임, store 범위, React 트리, 프레임과 고정 스텝 시계, 물리, 플러그인, 저장, 렌더링, NPC, 네트워크를 파일 경로와 함께 다루고, 복잡도가 몰린 곳을 짚는다. 엔진 코드를 고치기 전에 읽는 문서다. 파일 위치와 모듈 크기는 [repository.md](repository.md), 모듈별 상태와 결함은 [module-status.md](module-status.md)에 있다.

기준: 2026-09-27, `main` `2fcfcece`. 경로는 저장소 루트 기준이다.

## 모듈 계층

`src/core/<모듈>` 안의 폴더 이름이 계층을 정한다.

| 계층 | 경로 | 규칙 |
|---|---|---|
| 1 | `src/core/<모듈>/core/**` | 순수 로직. `react`, `zustand`, `@react-three/fiber`를 직접 import하면 eslint가, 다른 파일을 거쳐 닿으면 `check:layer1`이 막는다. `@react-three/rapier`만 허용(기준선 9개 edge) |
| 2 | `src/core/<모듈>/bridge/**` | 엔진 객체와 React를 잇는 bridge(`CoreBridge` 파생) |
| 3 | `components`, `controllers`, `hooks`, `stores` | React 컴포넌트, hook, zustand store |

아래 계층이 위 계층을 import하는 edge(1→2·3, 2→3)는 `src/__tests__/architectureBoundaries.test.ts`가 정확히 12개로 고정한다. 새 edge를 더해도, 하나를 없애고 기준선을 두어도 실패한다. 라이브러리 모듈은 런타임에 `gaesup-world/...` 진입점을 import하지 않는다.

## React 트리

`GaesupWorld`는 `WorldConfigProvider`의 별칭이다(`World`도 같은 컴포넌트). 런타임을 만들지 않고 `runtime` prop으로 받는다. 받지 않으면 legacy 전역 store로 돈다([store 범위](#store-범위)).

```text
<GaesupWorld urls cameraOption mode runtime? runtimeRevision?>   core/world/components/WorldContainer/index.tsx
└─ <GaesupRuntimeProvider runtime revision>                      core/runtime/context.tsx
   └─ GaesupRuntimeContext { runtime, revision }                 runtime을 안 넘기면 부모 값, 최상위 기본은 null
      └─ <GaesupStoreProvider value = runtime?.store ?? null>    core/stores/gaesupStore.ts
         └─ <TimeStoreProvider value = runtime?.timeStore ?? null>  core/time/stores/timeStore.ts
            └─ <WorldConfiguration>   urls·mode·cameraOption을 월드 store에 쓰고 children을 그대로 그린다
               └─ <Canvas gl={createRenderer}>                   소비자 코드. R3F 9가 바깥 context를 캔버스 트리로 잇는다
                  └─ <GaesupWorldContent quality postProcessing performance showGrid showAxes>
                     └─ <QualityProfileProvider quality>          core/perf/quality.tsx, pixel ratio 상한 1.5
                        ├─ <FrameSchedulerHost metrics={개발 모드}/>  core/runtime/frame/react/FrameSchedulerHost.tsx
                        └─ <Suspense>
                           ├─ <Camera/>                            core/camera/Camera.tsx → useCamera
                           ├─ <PerformanceCollector/>              performance ?? 개발 모드, 또는 샘플러 요청 시
                           ├─ <ShadowDepthMaterials/>              WebGLRenderer일 때만 동작
                           ├─ <Suspense> lazy WorldPostProcessing  postProcessing을 켤 때만 청크를 받는다
                           └─ <group name="gaesup-world"> (+ gridHelper, axesHelper)
                              └─ children, 예: <WorldPhysics>
                                               ├─ <GaesupController/>    = ControllerWrapper → EntityController → PhysicsEntity
                                               ├─ <BuildingController/>  BuildingSystem + NPCSystem
                                               └─ ...
```

- `GaesupRuntimeProvider`의 `runtime`이 `undefined`면 부모를 물려받고, `null`이면 명시적으로 legacy 범위를 고른다. `revision`은 런타임 수명 revision을 `useSyncExternalStore`로 구독한 값이다(`revision` prop을 주면 더한다).
- 월드 store와 time store만 전용 context로 내려간다. 나머지 도메인 store는 hook이 `useGaesupRuntime()?.<store>`로 찾는다.
- `GaesupWorldContent`는 `WorldPostProcessing`을 모듈 최상위 `lazy()`로 부르므로 후처리를 켜지 않은 월드는 그 청크를 받지 않는다. 품질 프로필 tier가 `low`·`medium`·`high`면 후처리 preset을 `performance`·`balanced`·`quality`로 고르고, 후처리가 없는 tier에서는 건너뛴다.

## 런타임 합성 루트

`createGaesupRuntime(options)`(`src/core/runtime/createGaesupRuntime.ts`, 513줄)가 월드 하나의 소유자 `GaesupRuntime`(`src/core/runtime/types.ts`)을 만든다. 라이브러리와 예제 안에는 이 함수를 부르는 코드가 없다. 소비자와 테스트가 부른다.

### 옵션

| 옵션 | 뜻 |
|---|---|
| `worldId` | 영속 월드 식별자. 생략하면 `createUniqueId()`. 기본 SaveSystem의 namespace가 된다 |
| `navigation` | `NavigationSystem` 설정 |
| `inputExtensionId` | 주 입력 확장 id. 기본 `DEFAULT_INTERACTION_INPUT_EXTENSION_ID` |
| `gamepad` | 게임패드 옵션, `false`면 끈다 |
| `plugins`, `pluginRuntime` | 플러그인 목록과 대상(`client` 기본, `server`, `editor`). `filterPluginsForRuntime`로 거른다 |
| `saveSystem`, `saveOptions`, `saveBindings`, `saveDiagnostics` | SaveSystem 주입 또는 옵션, 추가 도메인 바인딩, 진단 보관 개수(기본 50) |
| `assets` | `{ source, loadOnCreate }`. `loadOnCreate`면 setup 중에 이 런타임의 `assetStore`로 불러온다 |
| `logger` | 플러그인·런타임 logger(기본 no-op) |
| `onError` | 이 런타임이 가진 경계(시계, 이 런타임 아래 캔버스의 프레임 콜백, 플러그인 이벤트, 저장, 상호작용 명령)에서 잡힌 오류를 setup부터 dispose 완료까지 받는다. 경계들은 생성할 때 `runtime.reportError`를 받는다 |

### 만드는 것

호출 한 번에 객체 42개를 즉시 만든다(런타임 필드 41개 + 내부 `runtimeLogger`). `motions`, `motionBridge`, `animationBridge` 3개만 getter가 처음 읽힐 때 만든다. 합해 45개다. 오류 보고 함수 `reportError`는 객체가 아니라 closure이고, 시계·플러그인 이벤트 버스·저장 시스템·월드 store(상호작용 브리지)를 만들 때 넘긴다.

```text
createGaesupRuntime(options) → GaesupRuntime
│
├─ 즉시 생성 42
│  ├─ 상태 17 ────── store(월드) · assetStore · timeStore · weatherStore · dialogStore · audioStore · characterStore
│  │                 sceneStore · roomVisibilityStore · interactablesStore · buildingStore
│  │                 buildingRenderStore · buildingCullingStore · buildingVisibilityStore · npcStore
│  │                 worldObjectStore · worldBridge(worldObjectStore가 만든 WorldBridge)
│  ├─ 시간·통계 2 ── clockLoop = getTimeClock(timeStore) : AnimationClockLoop(FixedStepClock 60Hz) · stats(EngineStats)
│  ├─ 입력 4 ─────── inputAdapter(WorldInputBackend) · inputScope · inputActions · gamepad
│  ├─ 게임플레이 4 ─ gameplayEventRegistry · gameplayEvents(GameplayEventEngine) · cinematics · dialogRegistry
│  ├─ NPC 4 ─────── npcSimulation(npcStore, clockLoop, 어댑터, navigation) · npcScheduler
│  │                 npcBrainAdapters · npcReinforcement
│  ├─ 내비게이션 3 ─ navigation(NavigationSystem) · navigationObstacles · clickNavigation
│  ├─ 기타 4 ─────── stateManager(EntityStateManager) · grassManager · worldViews · audioEngine
│  ├─ 확장 1 ─────── plugins(PluginRegistry → context: events, logger, 확장 registry 13개)
│  └─ 저장 3 ─────── save(SaveSystem) · saveDiagnostics · runtimeLogger(내부)
│
└─ lazy 3 ────────── motions { physicsBridge, inputAdapter, events, extensionIds } · motionBridge · animationBridge
```

생성 직후에는 거의 모두 정지 상태다. 오디오 재생, 장면 전환, 게임플레이 이벤트, 입력 scope, NPC 두뇌 어댑터, 잔디 매니저, worldViews, 시계가 `suspend`된 채 만들어지고 `setup()`이 재개한다.

### setup이 등록하는 서비스

모두 `plugins.context.services`에 소유자 `'gaesup.runtime'`으로 등록된다. 플러그인은 `ctx.services.get(key)`로, 소비자는 `runtime.getService(key)`·`requireService(key)`로 꺼낸다.

| 서비스 id | 값 |
|---|---|
| `gaesup.runtime.time-store`(`RUNTIME_TIME_STORE_SERVICE_ID`) | `timeStore` |
| `gaesup.runtime.world-store`(`RUNTIME_GAESUP_STORE_SERVICE_ID`) | `store` |
| `gaesup.runtime.motions`(`RUNTIME_OWNED_MOTIONS_SERVICE_ID`) | `{ create: () => motions, inputExtensionId }` |
| `gaesup.runtime.<도메인>-store`(`runtimeStoreServiceKey(도메인)`) | building, npc, audio, character, scene, weather, dialog store |
| `gaesup.runtime.npc-brain-adapters`, `npc-reinforcement`, `interactables-store`, `input-actions`, `gamepad`, `cinematics` | 같은 이름의 런타임 객체 |
| `gaesup.runtime.world-object-store`, `world-bridge`, `world-views`, `input-scope`, `gameplay-event-registry`, `gameplay-events` | 같은 이름의 런타임 객체 |
| `runtime.saveDiagnostics`(`DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID`) | `saveDiagnostics` |
| `gaesup.runtime.save-system` | `save` |

`runtimeStoreServiceKey<T>(domain)`(`src/core/plugins/serviceKey.ts`)는 `gaesup.runtime.${domain}-store` 문자열에 값 타입을 실은 `ServiceKey<T>`를 만든다. 등록과 조회가 같은 키를 쓰므로 id가 어긋나지 않는다.

### setup 순서

`setup()`과 `dispose()`는 `enqueueLifecycle` 프라미스 체인으로 직렬화된다. 동시에 불러도 순서대로 돈다.

1. 이미 `active`면 끝. 상태를 `setting-up`으로.
2. `store.activateInteractions()`, `worldObjectStore.activateWorldBridge()`.
3. 위 서비스 24개 등록. SaveSystem 진단을 구독해 `runtimeLogger.warn`과 이벤트 `runtime:saveDiagnostic`으로 보낸다.
4. `options.saveBindings` 등록.
5. `assets.loadOnCreate`면 `loadAssets()` → `assetStore.getState().loadAssets(source)`.
6. `plugins.setupAll()`(아래 [플러그인](#플러그인)).
7. 플러그인이 `ctx.save`에 올린 도메인 바인딩을 SaveSystem에 등록하고, `plugins.onLifecycle`로 나중에 setup·dispose되는 플러그인의 바인딩도 따라간다. 이미 있는 key와 겹치면 거부하고 이벤트 `runtime:saveBindingRejected`를 낸다.
8. `gameplay-events` 세이브 바인딩 등록.
9. restore guard 등록(아래).
10. 입력 백엔드 선택: `plugins.context.input`에서 `inputExtensionId` 확장을 찾아 `createAdapter()`로 `inputAdapter`를 활성화하고 input registry 변경을 구독한다.
11. 상태 `active`. 게임플레이 이벤트, 장면 전환, 오디오, inputScope, 잔디, worldViews, NPC 어댑터·강화학습·시뮬레이션, interactables, inputActions, cinematics, 게임패드를 재개하고 `clockLoop.resume()`, 마지막에 `publishLifecycle()`로 revision을 올린다.
12. 어느 단계든 실패하면 `deactivateGeneration(true)`로 되돌리고(setup에 실패한 플러그인도 dispose), `inactive`로 둔 채 오류를 다시 던진다.

### dispose 순서

1. `dispose()`는 큐에 넣기 전에 `save.cancelPendingLoads()`를 부른다.
2. 게임패드·cinematics·입력·interactables·NPC 3종·worldViews·worldBridge·잔디·시계·게임플레이 이벤트·inputScope·장면 전환 정지, 방 가시성 reset, 오디오 정지.
3. `active`였으면 상태 `disposing`, `publishLifecycle()`.
4. `deactivateGeneration(false)`: restore guard 해제 → `audioEngine.dispose()` → world bridge 비활성 → 클릭 이동 요청 무효화·경로 비우기 → `plugins.disposeAll()`(setup 역순) → 아직 `ready`인 플러그인 개별 dispose → 플러그인 수명 구독 해제 → `navigation.dispose()` → 대화 닫기 → 건축 render·culling·visibility store reset → `store.disposeInteractions()` → motions의 physicsBridge, motionBridge, animationBridge dispose → 진단 구독 해제 → 모든 세이브 바인딩 해제 → 소유 서비스 제거. 단계마다 오류를 잡아 두고 전부 돈 뒤 첫 오류를 던진다.
5. 상태 `inactive`. 같은 런타임을 다시 `setup()`할 수 있다(`src/core/runtime/__tests__/createGaesupRuntime.test.ts`의 setup → dispose → setup).

정지 목록이 `dispose()`, `deactivateGeneration()`, 재개 목록이 `setup()` 끝에 손으로 따로 적혀 있다. 서브시스템을 추가하면 세 곳을 모두 고쳐야 한다.

### 수명 revision과 restore guard

- 상태: `inactive` → `setting-up` → `active` → `disposing` → `inactive`. `isActive()`, `getLifecycleRevision()`, `subscribeLifecycle(listener)`를 노출한다. revision은 setup 완료와 dispose 시작에 1씩 오른다. hook은 `useGaesupRuntimeRevision()`을 의존성에 넣어 재setup 뒤 서비스를 다시 잡는다(예: `usePhysicsBridge`).
- restore guard(`save.registerRestoreGuard`): 세이브 복원이 모든 도메인 검증을 마치고 적용하기 직전에 NPC 시뮬레이션, cinematics, 장면 전환, 게임플레이 이벤트를 멈추고 효과음을 끊는다. 해제 함수는 그 사이 런타임이 `active`를 유지하고 revision이 같을 때만 재개한다. 복원 중 쓰기가 플레이로 해석되지 않게 하는 장치다.

### 헤드리스 사용

브라우저 없이도 돈다. `requestAnimationFrame`이 없으면 `AnimationClockLoop`는 프레임을 예약하지 않고, 호출자가 시계를 직접 민다. 설치형 소비자 검증(`scripts/verify-package-consumer.cjs`의 `grounding-smoke.cjs`)이 이 경로를 쓴다.

```ts
const runtime = createGaesupRuntime();
await runtime.setup();
runtime.npcStore.getState().addInstance({ /* ... */ });
runtime.clockLoop.clock.stepTicks(60);        // 60Hz 고정 틱 60번 = 1초
const blob = runtime.save.createBlob();
await runtime.dispose();
```

## store 범위

`src/core/stores/lazyStore.ts`와 `src/core/stores/scopedStore.ts`가 규칙을 만든다.

- `lazyStore(create)`: import만으로는 store를 만들지 않는다. hook이나 정적 API(`getState`, `setState`, `subscribe`, `getInitialState`)에 처음 닿을 때 만들고 이후 같은 store를 쓴다.
- `lazyScopedStore(name, createLegacy, useOwnedStore)`: `{ useStore, useStoreApi }`를 돌려준다. React hook은 `useOwnedStore()`(가장 가까운 런타임의 store)를 읽고, 없으면 legacy 전역 store로 간다. 정적 API는 **항상** legacy 전역 store다. legacy store가 처음 만들어질 때 개발 모드에서 한 번 경고한다: `[useXStore] No runtime owns this store here, so the legacy global store was created. Legacy stores are removed in 2.0: ...`.
- 함정: 런타임 아래 코드에서 `useNPCStore.getState()`처럼 정적 API를 부르면 런타임 store가 아니라 legacy store를 건드린다. React 안에서는 `useXStoreApi().getState()`, 밖에서는 `runtime.xStore.getState()`를 쓴다. 지금 예제는 런타임 없이 정적 API를 쓰므로 legacy로 돈다(LIB-1).

| 구분 | store |
|---|---|
| 런타임 소유 + `lazyScopedStore`(14) | `useGaesupStore`(`store`, `GaesupStoreProvider` context), `useTimeStore`(`timeStore`, `TimeStoreProvider` context), `useWeatherStore`, `useDialogStore`, `useAudioStore`, `useCharacterStore`, `useSceneStore`, `useRoomVisibilityStore`, `useInteractablesStore`, `useBuildingStore`, `useBuildingRenderStateStore`(`buildingRenderStore`), `useBuildingGpuCullingStore`(`buildingCullingStore`), `useBuildingVisibilityStore`, `useNPCStore` |
| 런타임 소유 + 자체 fallback | `useWorldObjectStore`·`useWorldObjectStoreApi`(`src/core/world/stores/worldObjectStore.ts`): 런타임이 없으면 모듈 변수 legacy store, 경고 없음 |
| 전역 `lazyStore`(6) | `useAssetStore`(assets), `useEditorStore`(editor), `useI18nStore`, `usePerfStore`, `useToastStore`, `useUIConfigStore` |
| 소비자가 만드는 store | `createAvatarStore`(`src/avatar/store.ts`) |

legacy NPC store는 `buildNPCStore(true)`로 전역 두뇌 청사진 registry를 쓰고, legacy 오디오 store는 전역 `getAudioEngine()`에 붙는다.

### 새 도메인 store를 만드는 법

```ts
// src/core/foo/stores/fooStore.ts
export function createFooStore() {
  return create<FooState>()((set, get) => ({ /* 상태, serialize, prepareHydrate, hydrate */ }));
}
export type FooStore = ReturnType<typeof createFooStore>;
export const FOO_STORE_SERVICE = runtimeStoreServiceKey<FooStore>('foo');
export const { useStore: useFooStore, useStoreApi: useFooStoreApi } = lazyScopedStore(
  'useFooStore', createFooStore, () => useGaesupRuntime()?.fooStore,
);
```

1. 팩토리 `createFooStore()`를 두고, 모듈 전역 가변 상태(로드 세대 토큰, 캐시)는 팩토리 클로저 안에 둔다.
2. `GaesupRuntime` 타입(`src/core/runtime/types.ts`)에 `fooStore`를 더하고, `createGaesupRuntime`에서 만들고 `setup()`에서 `registerOwnedService(FOO_STORE_SERVICE, fooStore)`로 등록한다. 정지·reset이 필요하면 `dispose()`와 `deactivateGeneration()`에도 넣는다.
3. 저장이 필요하면 `createStoreDomainPlugin`으로 플러그인을 만들고 `resolveStore: (ctx) => ctx.services.get(FOO_STORE_SERVICE) ?? useFooStore`로 런타임 store를 잡는다(예: `src/core/weather/plugin.ts`). `prepareHydrate`는 검증만 하고 적용 함수를 돌려준다.

## 프레임 스케줄링

`src/core/runtime/frame/`. 컴포넌트는 raw `useFrame` 대신 `useEngineFrame`·`useSharedFrame`을 쓴다. raw `useFrame`은 eslint가 막고 품질 래칫이 센다(허용: `FrameSchedulerHost`, `GpuBatchBridge`, `WorldPostProcessing`).

| 순서 | 단계(`FRAME_PHASES`) | 주 사용처 |
|---:|---|---|
| 0 | `input` | `useInputActions`(`src/core/input/actions/react/useInputActions.ts`) |
| 1 | `script` | `useScriptRuntime`(스크립트 컴포넌트) |
| 2 | `prePhysics` | legacy 물리의 조작 계산(`usePhysicsBridge`), `BlueprintSpawner`, `RemotePlayer`. `WorldPhysics`가 마지막 항목(`order` 최대, `physics:advance`)에서 고정 시계를 민다 |
| 3 | `postPhysics` | `WorldPhysics`가 첫 항목(`physics:present`)에서 물리 자세를 보간해 보여 준다. `usePhysicsBridge` 결과 반영, `usePlayerPosition`, `useInteractionTarget` |
| 4 | `animation` | `useSharedAnimations`, `useCharacterAnimator`, `Avatar` |
| 5 | `lateUpdate` | `Footsteps`, `Footprints`, `TeleportDropEffect`, `OutfitAvatar`, WebGL 그림자 깊이 재질(500ms 주기) |
| 6 | `camera` | `useCamera`, `useCameraBridge` |
| 7 | `effects` | 건축 GPU 컬링·가시성 드라이버, 불·빌보드 등 메시 효과(가장 많이 쓰는 단계) |
| 8 | `snapshot` | 통계 샘플(`PerformanceCollector`) |

- **캔버스마다 스케줄러 하나**: `useCanvasFrameScheduler()`가 R3F root store를 키로 `WeakMap`에서 `FrameScheduler`를 꺼낸다. 캔버스 밖에서는 모듈 전역 `frameScheduler`를 돌려준다.
- **host**: `FrameSchedulerHost`는 R3F `useFrame` 두 개로 `input`~`prePhysics`를 우선순위 -100(`FRAME_PRE_PHYSICS_PRIORITY`)에, `postPhysics`~`snapshot`을 -1(`FRAME_SCHEDULER_PRIORITY`)에 돌린다. -50(`PHYSICS_STEP_PRIORITY`)은 그 사이 물리 자리다. 첫 host만 tick하고, 같은 캔버스에 host가 둘이면 개발 모드에서 경고한다. `FrameSchedulerHost`는 전역 `frameScheduler`의 첫 host가 되면 그것도 함께 tick한다. host가 없어도 `useEngineFrame`·`useSharedFrame`이 캔버스 스케줄러에 암묵 host(같은 두 우선순위의 R3F 구독, 캔버스 스케줄러만 tick)를 참조 카운트로 붙인다.
- **등록**: `useEngineFrame(phase, callback, { order, throttleMs, enabled, label, scheduler, active })`. 같은 단계 안에서는 `order`, 그다음 등록 순서다. tick 중에 추가한 콜백은 그 단계의 이번 순회에서는 돌지 않고, 해제한 콜백은 바로 멈춘다. 정리·재정렬은 단계가 끝난 뒤 한다. `useSharedFrame(channel, callback)`은 `(phase, label, order, throttleMs)`가 같은 콜백들을 스케줄러 항목 하나로 묶고 `(delta, elapsedSeconds, RootState)`를 넘긴다. `createFrameDriver(phase, update)`는 항목 목록 전체를 한 번에 도는 드라이버다(기본은 전역 `frameScheduler`).
- **오류 격리**: 콜백이 던져도 다음 프레임에 계속 돈다(Unity `Update`처럼). `reportThrottled`가 콜백마다 첫 오류와 이후 1초(`ERROR_REPORT_INTERVAL_MS`)에 한 번만 `source: 'frame'`으로 보고하고, 건너뛴 수를 `suppressed`로 붙인다.
- **metrics**: `setMetricsEnabled(true)`면 단계마다 `calls`·`totalMs`·`lastMs`를 `performance.now()`로 잰다. `GaesupWorldContent`는 개발 모드에서 켜고, `PerformanceCollector`가 0.25초마다 단계별 평균을 월드 store `framePhases`에 쓴다. host는 런타임 `stats`에 `frames` 소스를 등록한다.

## 시뮬레이션 시계

`src/core/simulation/`. 시간, 물리, NPC가 런타임마다 하나인 고정 스텝 시계를 공유한다.

- `FixedStepClock`: 기본 60Hz, 프레임당 최대 8 substep, 프레임 입력 상한 0.25초. 남는 시간은 누적기에 두고, 상한을 넘는 시간은 버리고 `discardedSeconds`에 센다. `interpolationAlpha`로 표시 보간 비율을 준다. `stepTicks(n)`은 재생·서버용으로 상한 없이 n틱을 돈다. 재진입은 예외다.
- 시스템(`ClockSystem`)은 `SIMULATION_PHASES` = `commands` → `simulation` → `physics` → `postSimulation` → `publish` 순서, 같은 단계에서는 `priority`, 그다음 등록 순서로 돈다. `acquireSystem(system, owner)`는 같은 owner의 같은 id를 참조 카운트로 공유한다. tick 중 등록은 다음 tick부터 보인다. 던지는 시스템은 `source: 'clock:<단계>'`로 1초 제한 보고되고 tick은 계속된다.
- `AnimationClockLoop`: 소비자 참조 카운트로 rAF 하나를 돌려 시계를 민다. `attachDriver()`로 캔버스 프레임에 미는 권한을 넘기면 자기 rAF를 멈춘다. `suspend()`·`resume()`은 소비자를 유지한 채 멈추고 다시 돈다(런타임 비활성화용).
- `getTimeClock(timeStore)`(`src/core/time/core/timeClock.ts`): time store마다 `AnimationClockLoop`를 `WeakMap`에 하나 만들고 `simulation` 단계 시스템 `time`으로 `timeStore.tick(ms)`을 등록한다. 런타임의 `clockLoop`가 바로 이것이다. 런타임 `stats`에 `fixedTicks`, `clockSystems`가 등록된다.

## 물리와 캐릭터

- `WorldPhysics`(`src/core/world/components/WorldPhysics/index.tsx`)는 Rapier `<Physics paused timeStep={clock.deltaSeconds} interpolate={false}>`를 감싼다. Rapier 자체 루프는 멈추고, `physics` 단계 시계 시스템 `rapier:<id>`가 `useRapier().step(delta)`를 부른다. 스텝 전후로 `PhysicsPresentation`이 body 자세를 기록하고, `postPhysics`에서 `interpolationAlpha`로 시각 그룹만 보간한다. Rapier body와 충돌은 보간하지 않는다.
- `frameloop="always"` 캔버스는 `attachDriver()`로 캔버스 프레임이 시계를 민다(입력 → 조작 → 고정 틱 → 표시 순서가 한 프레임 안에 맞는다). demand 캔버스는 시계 자기 rAF로 돈다. 런타임이 있으면 `runtime.isActive()`일 때만 돈다.
- `useWorldPhysicsStep(update)`는 조작 코드를 `simulation` 단계 시스템(`physics-controls:<id>`)으로 올려 Rapier 스텝보다 먼저 돌린다. `WorldPhysics` 밖(legacy `Physics`)이면 `false`를 돌려주고 호출자가 프레임 단계에서 돈다.
- 캐릭터 경로: `GaesupController`(= `ControllerWrapper`, `src/core/interactions/components/ControllerWrapper`) → `EntityController`(`src/core/motions/controller/EntityController.tsx`, 모드·URL·탈것 상태로 props 결정, 건축 편집 중에는 그리지 않음) → `PhysicsEntity`(`src/core/motions/entities/refs/PhysicsEntity.tsx`, glTF·캡슐 collider·애니메이션) → `useEntity`(`src/core/boilerplate/hooks/useEntity.ts`) → `usePhysicsBridge`(`src/core/motions/hooks/usePhysicsBridge.ts`) → `PhysicsBridge`(`CoreBridge`) → `PhysicsSystem`(`AbstractSystem`) → `EntityStateManager`.
- `usePhysicsBridge`의 motions 런타임 선택 순서: prop `motionsRuntime` → 런타임의 `motions.runtime` 서비스(`createMotionsPlugin`이 등록) → `runtime.motions` → 런타임이 없을 때만 모듈 전역 fallback(`getFallbackMotionsRuntime`).

## 플러그인

`src/core/plugins/`.

- `createPluginRegistry(options)` → `PluginRegistry`(500줄). `context`는 `events`(`InMemoryEventBus`), `logger`, `plugins`(읽기 API)와 확장 registry 13개 `grid`, `placement`, `assets`, `rendering`, `input`, `interactions`, `npc`, `blueprints`, `editor`, `save`, `services`, `systems`, `components`를 갖는다(`createPluginContext.ts`).
- registry는 `register`·`get`·`require`·`has`·`remove`·`removeByPlugin`·`list`·`clear`와 선택 `subscribe`를 갖는다. 알려진 id의 값 타입은 `GridExtensionMap` 같은 인터페이스를 declaration merging으로 넓혀 정하고, 서비스는 `ServiceKey<T>`(`defineService`, `runtimeStoreServiceKey`)로 타입을 싣는다.
- `GaesupPlugin`: `id`, `name`, `version`(semver), `runtime`(`client` 기본·`server`·`both`·`editor`), `capabilities`, `dependencies`, `optionalDependencies`, `setup(ctx)`, `dispose?(ctx)`. `defineGaesupPlugin`은 타입만 잡는 항등 함수, `validateGaesupPlugin`·`assertValidGaesupPlugin`은 검증이다.
- 수명: `register`는 기록만 한다(`registered`). `setupAll()`은 등록 순서로 돌되 필수 의존을 먼저 setup한다. 없는 의존은 `MissingPluginDependencyError`, 버전 불일치는 `PluginVersionMismatchError`, 순환은 `CircularPluginDependencyError`, 잘못된 manifest는 `PluginManifestValidationError`. 상태는 `setting-up` → `ready` 또는 `failed`. 끝나면 `requiredCapabilities`·`exclusiveCapabilities`·`capabilityConflicts` 진단을 logger로 경고한다. `disposeAll()`은 setup 역순이며, dispose된 플러그인이 올린 확장은 13개 registry 모두에서 `removeByPlugin`으로 지워진다. `use(plugin)`은 등록과 setup을 한 번에 한다.
- 이벤트 버스는 핸들러마다 격리한다. 하나가 던지면 `reportError(source: 'event-bus')`로 보고하고 나머지에게 계속 전달한다.
- 저장 연결: 플러그인은 `ctx.save.register(id, binding, pluginId)`로 도메인 바인딩을 올리고, 런타임이 이를 SaveSystem에 등록한다([setup 순서](#setup-순서) 8번). `createStoreDomainPlugin`이 이 패턴(세이브 바인딩 + store 서비스 + ready 이벤트)을 묶는다.
- 내장 플러그인 팩토리: `createBuildingPlugin`, `createCameraPlugin`, `createMotionsPlugin`, `createNPCPlugin`, `createTimePlugin`, `createWeatherPlugin`, `createAudioPlugin`, `createScenePlugin`, `createCharacterPlugin`, `createI18nPlugin`, `createAvatarPlugin`(`gaesup-world/avatar`).

```ts
const plugin = defineGaesupPlugin({
  id: 'my.plugin', name: 'My Plugin', version: '1.0.0',
  dependencies: ['gaesup.weather'],
  setup(ctx) {
    const weather = ctx.services.get(WEATHER_STORE_SERVICE);   // 런타임 소유 store
    ctx.save.register('my-domain', myBinding, 'my.plugin');    // 런타임이 SaveSystem에 연결
  },
});
const runtime = createGaesupRuntime({ plugins: [createWeatherPlugin(), plugin] });
```

## 저장

`src/core/save/`.

- `DomainBinding`(`src/core/save/types.ts`): `key`, `serialize()`, `hydrate(data)`, 선택 `prepareHydrate(data)`(변경 없이 검증하고 적용 함수를 돌려준다), `owned`(serialize 결과를 복제 없이 보관), `revision()`(바뀌면 증가, 변경 없는 자동 저장을 건너뛴다), `reset()`(세이브에 이 도메인이 없을 때 새 세션 상태로).
- `SaveSystem`: `register`(중복 key는 `DuplicateSaveDomainBindingError`), `createBlob`/`hydrateBlob`, `save(slot, { skipUnchanged })`, `load(slot, signal)`, `list`, `remove`. 한 번에 한 작업만(`Save operation already in progress`). 슬롯별 쓰기는 큐로 직렬화되고, `load`는 같은 슬롯의 대기 중 쓰기를 기다린다. 늦게 끝난 load·중단된 load는 세대 번호로 버린다(`cancelPendingLoads`).
- 복원 트랜잭션(`applyBlob`): envelope 검증 → 버전 확인·migration → 모든 도메인 prepare(여기까지 변경 없음, 실패하면 전부 거부) → 롤백용 스냅샷 직렬화 → restore guard 진입 → 도메인 순서대로 적용 → 하나라도 실패하거나 취소되면 이미 적용한 도메인(실패한 것 포함)을 역순으로 스냅샷에서 되돌린다 → guard 해제는 항상 역순으로. `isRestoring()`은 이 구간 내내 참이다.
- 진단: serialize·hydrate·rollback 실패와 guard 해제 실패를 `reportError(source: 'save:<단계>')`와 진단 리스너로 보낸다. 런타임의 `saveDiagnostics`(`src/core/runtime/saveDiagnostics.ts`)가 최근 50개를 보관하고 이벤트로 알린다. UI는 `RuntimeSaveDiagnosticsToaster`.
- 어댑터: `IndexedDBAdapter`(가능하면), `LocalStorageAdapter`, `NamespacedSaveAdapter`. `createDefaultSaveSystem({ namespace })`는 런타임에서 `worldId`로 namespace를 건다. `getSaveSystem()`은 모듈 싱글턴이다.
- 스냅샷: `src/core/platform/snapshot.ts`의 `WORLD_SNAPSHOT_DOMAINS`(building, scene, scene-document, character, assets, npc, camera, time, weather, audio)가 월드 스냅샷·방문 공유 대상이고, `PLAYER_PROGRESS_DOMAINS`(i18n)는 플레이어를 따라간다. `SceneDocument`는 `createSceneDocumentSaveBinding`(key `scene-document`)으로 붙는다.

## boilerplate 계층

`src/core/boilerplate/`(760줄)는 초기 ECS식 추상화다.

| 추상 | 역할 | 쓰는 곳 |
|---|---|---|
| `AbstractBridge` → `CoreBridge` | id별 엔진 등록·명령 실행·스냅샷·이벤트·미들웨어. `CoreBridge`는 개발 모드 로그 옵션을 더한다 | `PhysicsBridge`, `MotionBridge`(motions), `AnimationBridge`(animation), `WorldBridge`(world), `UIBridge`(ui) |
| `AbstractSystem`, `BaseSystem` | 상태·지표를 가진 시스템 기반 클래스 | `PhysicsSystem`, `MotionSystem`(motions), `AnimationSystem`, `InteractionSystem`, `AutomationSystem`, `MinimapSystem` |
| `BridgeFactory` | 런타임 없이 도는 호출자를 위한 클래스별 전역 단일 인스턴스 캐시 | `useWorldMotionBridge`, `ManagedMotionEntity`, `useAnimationBridge`, 잔디 매니저, world store slices, `useSpawnFromBlueprint`(blueprints) |
| hooks | `useEntity`, `useEntityLifecycle`, `useCollisionHandler`, `frameTime` | `PhysicsEntity` 등 |

런타임은 자기 `PhysicsBridge`·`MotionBridge`·`AnimationBridge`를 만든다. `BridgeFactory`는 legacy 경로다. `engine.ts`는 `index.ts`와 같은 재수출이며 motions의 `MotionSystem`·`PhysicsSystem`만 이 경로로 import한다. `test:memory:ci`가 이 모듈의 `src/core/boilerplate/__tests__/*.test.ts` 4개를 힙 사용량 기록과 함께 다시 돌린다. 엔티티 모델이 `boilerplate`, `blueprints`, `scene-object` 세 벌이라 통합 후보다([module-status.md](module-status.md)).

## 렌더링

`src/core/rendering/`.

- `createRenderer(props)`(`webgpu.ts`)는 `<Canvas gl={createRenderer}>`에 넘기는 비동기 팩토리다. `navigator.gpu`와 어댑터가 있으면 `three/webgpu`를 동적 import해 `WebGPURenderer`를 만들고 `init()`한다. API·어댑터가 없거나 모듈·생성자를 못 쓰면 `createLegacyRenderer`로 `WebGLRenderer`를 만든다. `init()` 실패는 backend를 정리하고 그대로 던진다. `dispose`와 `forceContextLoss`는 한 번만 도는 호환 함수로 바꿔 둔다.
- `rendererKind(renderer)`: `'webgpu'`(WebGPU 장치), `'webgpu-fallback'`(`WebGPURenderer`의 WebGL2 backend), `'webgl'`(`WebGLRenderer`). compute, storage buffer, GPU 배치는 `'webgpu'`에서만 쓴다. 렌더러·WebGPU 환경 검사는 이 파일에만 둔다(`src/__tests__/sourceRules.test.ts`).
- TSL: `src/core/rendering/tsl/`(fire, flag, grassMaterial, snow, toonWater, weather)과 `Node*` 컴포넌트(`building/components/mesh/NodeTreeParticles.tsx`, `fire/NodeFireEffects.tsx`, `flag/NodeFlagMaterial.tsx`, `grass/NodeGrassMaterial.tsx`, `snow/NodeGpuSnow.tsx`, `water/NodeWaterMaterial.tsx`, `weather/components/WeatherEffect/NodeWeather.tsx`). 메시 컴포넌트는 `rendererKind !== 'webgl'`이면 이쪽을 쓴다.
- `CompileGate`: 처음 보이는 콘텐츠를 숨긴 채 `compileAsync`로 파이프라인(그림자 cascade 포함)을 먼저 만들어 첫 그리기 프레임의 동기 셰이더 생성 멈춤을 없앤다. 콘텐츠의 Suspense 안에 둔다. three r185·r186에서만(`gpuBatchRevision.ts`) 켜진다. 건축의 벚꽃·깃발·불·빌보드·모델 오브젝트가 쓴다.
- `GpuBatchBridge`: 이름이 `building-batch:`로 시작하는 `InstancedMesh`를 compute 셰이더로 frustum 컬링하고 indirect draw로 그린다. `'webgpu'`와 three r185·r186에서만 켜진다. raw `useFrame`을 쓰는 두 파일 중 하나다.
- 후처리 `WorldPostProcessing`: WebGPU에서는 TSL `RenderPipeline`(TRAA, GTAO, bloom, 색 보정)을 캔버스의 단일 render owner로 돌린다. WebGL에서는 `@react-three/postprocessing` 기반 `ToonOutlines` + `ColorGrade`로 간다.
- 해·하늘·안개: `CascadedSun`(WebGPU에서 CSM 그림자), `DynamicSky`, `DynamicFog`. UP-1에서 three `SunLight`로 합칠 예정이다.
- 품질·성능: `QualityProfileProvider`(tier, pixel ratio, 그림자 크기, 후처리 preset), `PerformanceCollector`(렌더 뒤 `addAfterEffect`로 renderer 통계를 4Hz 이하로 샘플), `IdleFrameRate`(입력이 없으면 낮은 fps로 그림).

WebGL 전용 경로(GPU-1에서 지울 대상):

| 경로 | 위치 |
|---|---|
| `WebGLRenderer` 생성 | `createLegacyRenderer`(`webgpu.ts`, 루트 export). `MultiplayerCanvas`(`src/core/networks/components/MultiplayerCanvas.tsx`)는 `gl`을 넘기지 않아 R3F 기본 `WebGLRenderer`로 그린다 |
| `rendererKind`가 `'webgl'`과 비교되는 분기 | 9개 파일 10곳: `building/components/mesh/fire/index.tsx`(2), `flag/index.tsx`, `grass/Grass.tsx`, `sakura.tsx`, `snow/index.tsx`, `water/index.tsx`, `rendering/postprocess/WorldPostProcessing.tsx`, `rendering/shadow/ShadowDepthMaterials.tsx`, `weather/components/WeatherEffect/index.tsx`. `CascadedSun`에는 `!== 'webgpu'` 분기가 따로 있다 |
| GLSL | `.glsl` 6개(fire, flag, grass의 vert·frag), `shaderMaterial`·`ShaderMaterial`을 쓰는 파일 8개(위 메시 6개, `grass/GrassDepthMaterial.tsx`, `rendering/legacyDrei.ts`), `vite-plugin-glsl` |
| WebGL 그림자 깊이 재질 | `rendering/shadow/ShadowDepthMaterials.tsx`, `depthMaterialCache.ts` |
| `@react-three/postprocessing` | `rendering/outline.tsx`(`ToonOutlines`, `Outlined`), `postprocess/ColorGrade.tsx`, `postprocess/LutOverlay.tsx` |
| drei WebGL helper | `LegacyGrid`(drei `Grid`, 루트 export), `legacyDrei.ts`의 `Grid`·`Line`·`Text`·`shaderMaterial` |

## NPC

`src/core/npc/`.

- `npcStore`(`stores/npcStore.ts`): 템플릿, 카테고리, 옷 세트, 애니메이션, 인스턴스, 두뇌 청사진을 immer `Map`으로 담는다. 런타임 store는 `setState`를 감싸 대량 쓰기(복원 포함) 전에 대기 중인 두뇌 요청을 무효화한다.
- `NPCSimulation`(`core/NPCSimulation.ts`): store당 하나(두 번째 생성은 예외). 인스턴스가 있을 때만 `simulation` 단계 시스템 `npc-simulation`(priority -10)을 등록하고 시계를 잡는다. 틱마다 이동 경로를 따라 자세를 옮기고(`NavigationSystem`이 준비되면 벽을 도는 경로), 묶인 body에 쓴다(kinematic은 움직였을 때만 `setNextKinematic*`). 자세는 store에 쓰지 않아 React가 틱마다 다시 그리지 않는다. 세이브는 `poseRevision`과 `snapshotInstances()`로 실제 자세를 읽는다.
- 결정: 두뇌 모드가 `none`이 아니면 `max(0.5, behavior.waitSeconds ?? 1)`초 간격으로, NPC id에 따른 위상으로 흩어 결정한다. 지각은 `NPCPerceptionIndex`(`SpatialGrid` 셀 16m)가 시야 반경 안의 대상을 모은다. 플레이어 같은 비NPC 대상은 `setActor`로 넣는다.
- 두뇌: `createNPCBrainAdapterRegistry()`에 `(mode, id)`로 어댑터를 등록하고 `policyId` → `providerId` → `'default'` 순서로 찾는다. 모드는 `none`, `scripted`, `llm`, `reinforcement`. 어댑터가 없으면 `scripted`만 내장 규칙(idle·wander·patrol 행동, 두뇌 청사진)으로 결정한다. 강화학습 어댑터(`core/reinforcement.ts`)는 정책 서버에 요청하며 endpoint가 비면 아무것도 보내지 않는다. 런타임 시뮬레이션은 `scoped: true`로 런타임 store의 두뇌 청사진을 쓴다.
- 행동 적용: `speak`·`lookAt`은 시뮬레이션이 직접 처리한다(말풍선 상태는 저장하지 않는다). 나머지 행동만 store에 쓰며, 행동이 없는 틱은 store를 건드리지 않는다.
- 그리기: `NPCSystem`(`BuildingController`가 마운트)과 `NPCInstance`. 런타임이 없으면 `useNPCSimulation()`이 legacy store에 시뮬레이션을 만들어 `acquire()`하고 전역 `NavigationSystem.getInstance()`를 쓴다.

## 네트워크

`src/core/networks/`. 저장소에 서버는 없다. 기본 WebSocket 주소는 `ws://localhost:8090`(`config/defaultConfig.ts`).

- `PlayerNetworkManager`(`core/PlayerNetworkManager.ts`, 1,006줄): 방 입장·위치 갱신·퇴장·채팅·ping, 재연결(지수 지연, 최대 30초), 끊긴 원격 플레이어 10초 유예, pong이 없으면 소켓을 닫고(코드 4000) 재연결, 피어별 속도 제한, ACK·재시도가 있는 신뢰 메시지, 오프라인 큐, 원격 `modelUrl` 허용 검사.
- `useMultiplayer`(`hooks/useMultiplayer.ts`): 매니저, `PlayerPositionTracker`(기본 20Hz 추적), `LivePlayerMap`을 묶어 `connect`, `disconnect`, `startTracking`, `sendChat`, 말풍선 상태를 준다. `usePlayerNetwork`는 더 낮은 단계 hook이다.
- 컴포넌트: `RemotePlayers`·`RemotePlayer`, `PlayerInfoOverlay`, `ConnectionForm`, 완성 장면 `MultiplayerCanvas`.
- 방문(`visit/`): `serializeVisit`, `applyVisitSnapshot`, `captureVisitRestorePoint`, `visitProviderFromSaveSystem`, 채널 `createLocalVisitChannel`·`createWebSocketVisitChannel`, hook `useVisitRoom`(방문 중 로컬 도메인 백업과 자동 저장 중지). `atomic: true`는 적용과 되돌리기를 모두 먼저 준비하고, 적용 중 실패하면 실패한 도메인과 적용한 도메인을 역순으로 되돌린다(`failed`, `unrestored`). 복귀 지점의 `restore()`는 best effort다(ISO-2).
- 서버 권한 계약(`adapter/`): `createGameCommand`, `createServerEvent`, `createStateDelta`, `createSnapshotAck`, `createCommandAuthorityRouter`, `MockNetworkAdapter`. `gaesup-world/server-contracts`로 React 없이 쓸 수 있다.
- DEL-2(`2fcfcece`)에서 서로만 참조하던 NPC 네트워크 층(`NetworkBridge` 등)을 지웠다. `NetworkConfig`는 멀티플레이 클라이언트가 읽는 8개 필드만 남았다.

## 런타임 밖 전역 상태

런타임을 만들어도 아래는 모듈 전역이다. 월드 두 개를 한 페이지에 띄우면 섞이거나, legacy 경로에서만 쓰인다.

| 전역 | 위치 | 영향 |
|---|---|---|
| 페이지 기본 오류 보고 | `src/core/utils/reportError.ts`의 `reportError`·`sink` | 런타임이 없는 경계와, setup 전·dispose 뒤의 런타임 보고가 쓴다. `setErrorSink`는 이 기본값만 바꾼다 |
| glTF 캐시 | `src/core/assets/GLTFAssetCache.ts`의 `gltfAssetCache` | 모델과 보존 목록(최근 24개)을 모든 월드가 같이 쓴다 |
| 자동 저장 중지 카운터 | `src/core/save/core/autoSaveSuspension.ts` | 방문 중 중지가 모든 월드에 걸린다 |
| legacy store | `lazyScopedStore`의 정적 API, `lazyStore` 6개 | [store 범위](#store-범위) |
| 전역 프레임 스케줄러 | `frameScheduler`(`src/core/runtime/frame/FrameScheduler.ts`) | 캔버스 밖 등록과 `createFrameDriver` 기본값 |
| 싱글턴 | `NavigationSystem.getInstance()`, `InteractionSystem.getInstance()`, `MinimapSystem.getInstance()`, `getSaveSystem()`, `getAudioEngine()`, `getDialogRegistry()`(런타임은 자기 `dialogRegistry`), `getGameplayEventRegistry()`, `getNPCScheduler()`, `getGlobalStateManager()`, `getGlobalAnimationBridge()`, `BridgeFactory` 캐시, 기본 NPC 두뇌 어댑터(`registerNPCBrainAdapter`), `usePhysicsBridge`의 fallback motions 런타임 | legacy 경로의 기본값 |

## 복잡도 핫스팟

### 구조

1. **런타임이 모든 것을 즉시 만든다.** 월드마다 45개(즉시 42 + lazy 3)를 만들고, 정지·재개 목록을 `setup()`, `dispose()`, `deactivateGeneration()` 세 곳에 손으로 적는다. 서브시스템 하나를 더하면 세 곳과 타입, 서비스 등록을 함께 고쳐야 한다.
2. **기본 경로가 legacy다.** `GaesupWorld`가 런타임을 만들지 않고 라이브러리·예제에 `createGaesupRuntime` 호출이 없어, `GaesupWorld`만 쓰는 소비자는 legacy 전역 store로 돌고 개발 모드 경고를 받는다. 정적 store API는 런타임 아래에서도 legacy를 가리킨다(LIB-1).
3. **렌더링 두 벌(GPU-1)과 해·아바타 두 벌(UP-1).** 위 [렌더링](#렌더링) 표.
4. **루트 진입점이 에디터를 통째로 재수출한다(LIB-1).** `src/index.ts`의 `export * from './core/editor'`.

### 큰 파일

| 파일 | 줄 | 내용 |
|---|---:|---|
| `src/core/networks/core/PlayerNetworkManager.ts` | 1,006 | 연결·재연결·ping·속도 제한·신뢰 전송·채팅을 한 클래스에 |
| `src/core/building/components/mesh/sakura.tsx` | 852 | GLSL·TSL 두 경로 |
| `src/core/building/components/mesh/fire/index.tsx` | 778 | GLSL·TSL 두 경로 |
| `src/core/navigation/NavigationSystem.ts` | 743 | 격자, WASM 연결, A* fallback, 장애물 |
| `src/core/building/types/index.ts` | 740 | 타입과 프리셋 데이터 |
| `src/core/editor/components/panels/BuildingPanel/index.tsx` | 645 | 건축 편집 패널 |
| `src/core/scene-object/commands.ts` | 631 | 장면 명령 |
| `src/core/building/components/mesh/grass/Grass.tsx` | 623 | 잔디 이중 경로, LOD, 컬링 |
| `src/core/animation/core/animator/AnimatorRuntime.ts` | 609 | 애니메이터 상태 머신 |
| `src/core/interactions/core/AutomationSystem.ts` | 593 | 자동화 큐 |
| `src/core/interactions/bridge/InteractionBridge.ts` | 591 | 입력 bridge |
| `src/core/building/model/placement.ts` | 586 | 건축 배치 규칙 |
| `src/core/editor/components/EditorLayout/index.tsx` | 571 | 에디터 셸 |
| `src/core/runtime/createGaesupRuntime.ts` | 513 | 합성 루트 |
| `src/core/plugins/PluginRegistry.ts` | 500 | 플러그인 수명·의존·semver |

## 관련 문서

- 개발: [repository.md](repository.md) · [module-status.md](module-status.md) · [verification.md](verification.md) · [principles.md](principles.md) · [workflow.md](workflow.md) · [measurement.md](measurement.md) · [decisions.md](decisions.md) · [trends-2026.md](trends-2026.md)
- 사용: [../guide/world-runtime.md](../guide/world-runtime.md) · [../guide/rendering.md](../guide/rendering.md) · [../guide/save-network.md](../guide/save-network.md) · [../guide/npc-dialog-gameplay.md](../guide/npc-dialog-gameplay.md)
- 계획: [../../PRD.md](../../PRD.md) · 규칙: [../../CLAUDE.md](../../CLAUDE.md)
