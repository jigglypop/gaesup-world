# PRD-23 boilerplate 정리와 오류 처리

| 항목 | 값 |
|---|---|
| 우선순위 | P0 |
| 트랙 | Fast |
| 선행 PRD | 00(D-02, D-04, D-12, D-16) |
| 담당 agent | architect |

## 1. 배경과 문제

`src/core/boilerplate`(비테스트 2,954줄, 테스트 25파일 7,481줄로 전체 테스트 줄의 12%)는 decorator, DI 컨테이너, bridge 등록, entity 관리를 제공한다. 실제로는 다음과 같다.

1. `@HandleError`가 67개 메서드의 예외를 삼키고 `undefined`를 반환한다. production과 test에서 logger가 꺼져 있어 흔적이 남지 않는다(D-04).
2. DI 주입은 `emitDecoratorMetadata: false` 때문에 동작하지 않는다. `ManagedEntity`/`useManagedEntity`는 항상 throw한다(D-02). 테스트는 이를 mock으로 가린다.
3. bridge 등록 경로가 5개이고 singleton 캐시가 2개다(D-12).
4. 사용처가 없는 decorator가 14개 이상이고, `reflect-metadata`가 전역 polyfill로 모든 소비자에게 강제된다.

`CoreBridge`/`AbstractBridge`의 `buildEngine`, `executeCommand`, `createSnapshot` 계약과 이벤트 관찰자 없을 때 이벤트 생략 같은 최적화는 유지할 가치가 있다.

## 2. 목표 / 비목표

**목표**
- 예외가 조용히 사라지는 경로를 없앤다. 오류는 phase·명령 경계에서 한 번 잡고 보고한다.
- 동작하지 않거나 쓰이지 않는 DI·decorator를 제거한다.
- bridge 등록을 명시적 목록 하나로 만든다.

**비목표**
- `CoreBridge` 계약 변경(AGENTS.md가 정한 bridge 책임 분리는 유지).
- 새 DI 프레임워크 도입.

## 3. 현재 상태

**23-F01 `@HandleError` 예외 은폐(D-04)** [확인]
- `boilerplate/decorators/system.ts:30-49` try/catch → `logger.error` → `return defaultReturn`(기본 `undefined`).
- `utils/logger.ts:17` `enabled = nodeEnv !== 'production' && nodeEnv !== 'test'`.
- 적용 67곳. 반환 타입이 거짓이 됨: `PhysicsSystem.ts:459-460` `calculateJump(): THREE.Vector3`, `MotionSystem.ts:258-259`. 매 프레임 경로(`PhysicsSystem.calculate/drive/resolve`, `BaseController.update`) 포함.
- async 메서드 11곳(`SaveLoadManager.ts:58-60,84,116,138`, `AbstractSystem.ts:67,72`, `WorldSystem.ts:64` 등)은 동기 try/catch라 rejection을 잡지 못한다.
- 같은 파일의 한국어 JSDoc이 인코딩 깨짐 상태다(`system.ts:28`, `decorators/bridge.ts:72` 외, 3파일 12줄).

**23-F02 동작하지 않는 DI(D-02)** [확인]
- `tsconfig.json:62` `emitDecoratorMetadata: false`, SWC `tsDecorators`도 metadata 미생성. `di/container.ts:90` `design:paramtypes`, `:125` `design:type` 의존 → 생성자 주입과 `@Autowired` 항상 비어 있음.
- `ManagedEntity.ts:10` `@Autowired() private bridge!` 미주입 → `initialize()`(`:27-29`) 항상 throw.
- `hooks/__tests__/useManagedEntity.test.ts:45,62`가 `../../di`와 `ManagedEntity`를 mock.
- 실제로 동작하는 주입은 `@Inject` property(`MotionSystem.ts:149`)뿐.

**23-F03 bridge 등록 경로 5개, 캐시 2개(D-12)** [확인]
- `DomainBridge` 2회 정의: `decorators/index.ts:7`(DI 등록 포함), `decorators/blueprint/BridgeDecorators.ts:5`(DI 미포함, `export *`에서 가려짐).
- `RegisterBridge`(`decorators/bridge.ts:134`, 사용 0, 인스턴스 생성마다 재등록).
- `initializeBridges()`를 엔트리 3곳(`src/index.ts:4`, `src/runtime.ts:4`, `src/editor.ts:4`)에서 호출.
- `BridgeFactory.getOrCreateFor` 재등록(`BridgeFactory.ts:46`): import 시점 등록이 bundler에서 빠질 때의 workaround. `sideEffects` 선언과 decorator import-time 등록의 충돌 결과(15-F02).
- `DIContainer.singletons`와 `BridgeFactory.instances` 중 `BridgeFactory.dispose()`는 후자만 지움.

**23-F04 쓰이지 않는 코드** [확인]
- `SystemRegistry`: `@RegisterSystem` 4곳이 쓰기만 하고 boilerplate 밖 읽기 0. `WorldSystem` 생성마다 `'world'` 키 덮어쓰기 + warn.
- `@ManageRuntime` 6곳(AnimationSystem, CameraSystem, AutomationSystem, MotionSystem, PhysicsSystem, MinimapSystem) 모두 `autoStart: false`. rAF 루프는 dead code, Proxy 오버헤드만 남음.
- 사용 0 decorator: `Log, Delay, RateLimit, Hook, MemoryProfile, TrackCalls, Validate, DebugLog, PerformanceLog, Singleton, RequireEngine, Blueprint, BlueprintProperty, FromBlueprint`.
- `@Command`의 `'commands'` metadata는 쓰기만 하고 소비 0. `Validate`가 읽는 `'commandName'`은 정의되지 않음.
- `reflect-metadata` 13모듈 import + dependencies.
- export snapshot에 DIContainer/BridgeFactory/decorator가 없어 공개 API 영향 없이 제거 가능.

**23-F05 `@Timeout`(D-16)** [확인]
- `monitoring.ts:346-354` `setTimeout` 미해제, 원 작업 미취소.

**23-F06 오류 처리 전반** [실측]
- catch 절 242개 중 빈 catch 1(`hooks/useClicker/index.ts:148`), 주석만 있는 catch 28, 로그 없이 return 41(대부분 파싱 검증으로 의도됨).
- 커스텀 Error 클래스 17개에 공통 base나 `code` 필드가 없다.
- `src/core/error`는 `GaesupErrorBoundary`(public)만 있고 내부 사용 0. 별도 `ModelErrorBoundary`와 NPC part boundary 존재(21 PRD).
- `jest.setup.js`가 `logger.disable()`로 decorator 로그 경로를 전부 가림.

**23-F07 decorator·DI 사용 실태** [실측, 2026-09-24 2차]
- 비테스트 코드의 decorator: `@Profile` 67(이 PRD 카운터에 없음), `@HandleError` 67, `@RequireEngineById` 16, `@LogSnapshot` 7, 나머지 각 6 이하. `reflect-metadata` import 14파일.
- 실제 DI 사용은 `@Service` 1개(`motions/core/services/MotionService.ts:7`)와 `@Inject` 1개(`MotionSystem.ts:149`)뿐이다.
- `useManagedEntity`, `useBaseFrame`, `useBaseLifecycle`, `useEntityLifecycle`, `SystemRegistry`, `ManagedEntity`는 boilerplate 밖 사용 0.
- `boilerplate/hooks/frameTime.ts`는 importer 15개이고 `runtime/frame`도 포함한다. kernel 코드가 boilerplate에 있다.
- 제거 범위 [추정]: 유지 `bridge/`(328줄), `AbstractSystem`/`BaseSystem`(230줄), `frameTime`(kernel로 이동). `useEntity`, `useCollisionHandler`는 `motions/hooks`로 이동. `di/`, `decorators/`, `ManagedEntity`, `SystemRegistry`, 나머지 hook 삭제로 운영 코드 약 2,300줄, 테스트 약 5,500줄 감소. 이후 `reflect-metadata`, `experimentalDecorators`를 제거하면 `sideEffects: false`가 가능하다(15-g).

## 4. 요구사항

**FR**
- FR-23-01: 프레임 hot path(PhysicsSystem, MotionSystem, BaseController 등)에서 `@HandleError`를 제거한다. 오류는 `FrameScheduler` phase 경계에서 이미 격리되므로 거기서 한 번 보고한다.
- FR-23-02: async 메서드의 `@HandleError`를 제거하고 명시적 `Result` 반환 또는 호출자 전파로 바꾼다.
- FR-23-03: 오류 보고 경로 `reportError(error, context)`를 kernel에 두고, logger 비활성 여부와 무관하게 등록된 sink(개발 콘솔, 소비자 콜백)로 전달한다. production 기본 sink는 소비자가 runtime 옵션으로 지정한다.
- FR-23-04: `@HandleError` decorator를 삭제한다.
- FR-23-05: `@DomainBridge`/`@EnableEventLog`를 `static readonly domain`과 명시적 `CORE_BRIDGES` 목록으로 바꾼다. `RegisterBridge`, `BridgeDecorators`의 사본, `BridgeFactory` 재등록 workaround를 삭제한다.
- FR-23-06: `ManagedEntity` 계열, `SystemRegistry`, `@ManageRuntime`, 사용 0 decorator와 그 테스트를 삭제한다. `@Inject` property 주입은 생성자 인자로 바꾼다.
- FR-23-07: `reflect-metadata`와 `experimentalDecorators`를 제거한다.
- FR-23-08: bridge 인스턴스 캐시는 runtime 소유 하나로 합친다(22 PRD).
- FR-23-09: 공통 `GaesupError`(name, `code`, `cause`)를 두고 커스텀 Error 17개가 상속한다.
- FR-23-10: 빈 catch와 주석만 있는 catch는 이유를 코드(`reportError` 또는 명시적 무시 함수)로 표현한다.
- FR-23-11: 깨진 인코딩 주석을 복원하거나 삭제한다.
- FR-23-12: `@Profile`은 FrameScheduler metrics로 대체하고 삭제한다. `frameTime`은 kernel로 옮긴다(20 FR-20-06).

**NFR**
- NFR-23-01: 공개 함수의 반환 타입이 실제 반환값과 일치한다(예외 시 `undefined` 반환 금지).
- NFR-23-02: production에서 발생한 엔진 오류가 소비자 sink에 전달된다.
- NFR-23-03: export snapshot 불변.

## 5. 설계

```
FrameScheduler.tick
  └─ phase 실행 (try/catch 1회) ──► reportError(err, { phase, entryId })
Bridge.execute(command)
  └─ executeCommand (try/catch 1회) ──► reportError(err, { domain, command.type })
runtime options: { onError?: (err: GaesupError, ctx) => void }
```

decorator 제거는 동작 변경이 있는 slice와 없는 slice를 나눈다. 사용 0 decorator 삭제는 동작 변경이 없고, `@HandleError` 제거는 예외가 전파되므로 동작 변경이다.

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 23-a | `check-quality-ratchet.cjs`에 `handleErrorDecorators`, `profileDecorators`, `reflectMetadataImports` 카운터 추가 | 현재값(67, 67, 14)에서 감소만 허용 |
| 23-b | 사용 0 decorator, `SystemRegistry`, `@ManageRuntime`, `ManagedEntity` 계열과 테스트 삭제(D-02) | export snapshot 불변, 테스트 약 1,240줄 이상 감소 |

23-b 완료(2026-09-24): `ManagedEntity`, `useManagedEntity`, `useBaseFrame`, `useBaseLifecycle`, `SystemRegistry`, `@RegisterSystem`, `@ManageRuntime`, `@Autowired`, `LogInitialization`, `Log`, `Delay`, `RateLimit`, `Hook`, `MemoryProfile`, `TrackCalls`, `Validate`, `DebugLog`, `PerformanceLog`, `Singleton`, `RegisterBridge`, `RequireEngine`, `Blueprint`/`BlueprintProperty`/`FromBlueprint`, `BridgeDecorators`의 `DomainBridge`/`Command` 사본을 삭제했다. 39파일, 약 5,470줄 감소(대부분 테스트). `useEntityLifecycle`은 `useEntity`가 쓰므로 유지한다. export snapshot 불변.
| 23-c | `reportError`와 runtime `onError`, phase·명령 경계 catch | 예외 전파 단위 테스트, production 모드 sink 호출 테스트 |
| 23-d | hot path `@HandleError` 제거 | 예외가 phase 경계에서 보고되는지 테스트 |
| 23-e | async `@HandleError` 제거, `@Timeout` 제거 또는 수정(D-16) | rejection 전파 테스트 |
| 23-f | `@HandleError`, `@Profile` 전체 삭제(FR-23-12) | 카운터 0 |
| 23-g | bridge 등록 명시 목록화, 캐시 단일화(D-12) | `BridgeRegistry.list()` 결과 동일, dispose 후 재생성 테스트 |
| 23-h | `reflect-metadata`, `experimentalDecorators` 제거 | `grep -r "reflect-metadata" src` 0 |
| 23-i | `GaesupError` 계층, catch 정리, 인코딩 복원 | 빈 catch 0 |

## 7. 공개 API 영향

- `@HandleError` 제거로 기존에 `undefined`를 받던 호출자가 예외를 받는다. runtime `onError` 추가와 함께 minor 릴리스 노트에 명시한다(열린 질문 1).
- `useManagedEntity`, `useBatchManagedEntities`는 export snapshot에 없다(내부 `boilerplate/hooks` barrel에서만 export). 제거해도 공개 API 영향이 없다.
- runtime 옵션 `onError` 추가(추가만).

## 8. 검증과 완료 기준

```bash
corepack pnpm test -- src/core/boilerplate src/core/motions src/core/camera src/core/world --runInBand
corepack pnpm test -- src/__tests__/exportSnapshot.test.ts src/__tests__/publicApi.test.ts --runInBand
node scripts/check-quality-ratchet.cjs
corepack pnpm exec tsc -p tsconfig.build.json --noEmit
```

완료 기준: NFR-23-01~03 충족, `@HandleError`·`reflect-metadata` 0.

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 예외 전파로 기존에 조용히 지나가던 프레임 오류가 드러남 | phase 경계에서 잡아 해당 entry만 비활성화하는 기존 `FrameScheduler` 예외 격리 사용 |
| decorator 삭제 중 import-time 등록 누락 | 23-g에서 `CORE_BRIDGES` 목록과 `BridgeRegistry.list()` 비교 테스트 |

## 10. 열린 질문

1. `@HandleError` 제거로 인한 동작 변경을 minor로 낼 것인가, major로 묶을 것인가.
2. production 기본 오류 sink를 무엇으로 할 것인가(없음, `console.error`, 소비자 필수 지정).
