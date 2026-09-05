# Epoch 2l: Aggregate Interaction Type Boundary

## 목표

`InteractionState`, `InteractionConfig`, `InteractionMetrics`의 중복 정의를 Layer 1 core의 단일 canonical schema로 통합하고 `InteractionSystem`의 마지막 bridge type dependency를 제거해 architecture exact baseline을 17개에서 16개로 줄인다.

## 현재 상태

- core와 bridge가 aggregate interaction schema 세 종을 각각 정의한다.
- State와 Config의 필드는 동일하다.
- public bridge `InteractionMetrics`에는 required `lastUpdate: number`가 있지만 core 중복 타입에는 누락되어 있다.
- `InteractionSystem`은 raw input quartet은 core에서, aggregate 세 타입만 `../bridge`에서 type-import하므로 interactions domain에 upward edge 한 건이 남아 있다.
- System의 `BaseState`/`BaseMetrics` intersection에도 `lastUpdate`/`frameTime`이 있지만 store·bridge·package consumers는 이 local intersection을 거치지 않으므로 canonical public schema의 flat fields를 제거할 수 없다.

## 범위

- core의 State/Config/Metrics를 기존 public declaration kind와 같은 canonical interface로 정의한다.
- canonical `InteractionMetrics`에 기존 public required `lastUpdate: number`를 포함한다.
- bridge의 세 중복 interface를 제거하고 canonical original symbol을 내부 계약에 import하며 기존 bridge/root 경로로 direct type re-export한다.
- core barrel은 세 aggregate 타입을 명시적으로 type-export한다.
- `InteractionSystem`은 aggregate 세 타입도 `./types`에서 가져오고 bridge import를 완전히 제거한다.
- architecture baseline에서 남은 System aggregate import-type edge를 제거해 17개에서 16개로 낮춘다.
- package consumer ESM/CJS에서 State/Config/Metrics의 full nested shape와 required fields를 양방향 exact type 및 실제 값으로 검증한다.

## 제외 범위

- System constructor를 factory initializer로 전환하지 않는다.
- reset defaults, nested identity, config와 callback 보존 의미를 변경하지 않는다.
- `state.lastUpdate`, `metrics.lastUpdate`, `frameTime`의 갱신 시점이나 dormant timestamp 의미를 수정하지 않는다.
- `BaseState`, `BaseMetrics`를 변경하거나 aggregate schema에서 flat fields를 제거하지 않는다.
- Store와 System의 config/metrics/isActive source of truth를 통합하지 않는다.
- Bridge snapshot의 clone/live-ref/identity 의미를 바꾸지 않는다.
- `InteractionSnapshot`, command/event/payload 타입과 broad consumer import 경로를 변경하지 않는다.
- 새 package subpath, runtime export와 root export-star module augmentation 계약을 추가하지 않는다.

## Source of Truth

- `src/core/interactions/core/types.ts`의 세 canonical interface가 aggregate interaction schema의 유일한 정의다.
- `bridge/types.ts`는 같은 original symbol을 사용하는 compatibility projection이다.
- schema source of truth만 통합하며 runtime state source는 System, backend, bridge snapshot과 Zustand store에 현재처럼 분산된 상태를 보존한다.
- public compatibility를 위해 State의 `lastUpdate`, Metrics의 `lastUpdate`와 `frameTime`을 각각 required flat field로 유지한다.

## 호환성 계약

- 세 타입의 이름, nested fields, requiredness, array와 numeric/boolean field types를 유지한다.
- 기존 root와 bridge import 경로를 유지하고 canonical origin의 interface declaration kind를 보존한다.
- `InteractionSystem` public/runtime methods, state/metrics object identity, reset/update/event와 snapshot observable behavior는 바뀌지 않는다.
- dormant `metrics.lastUpdate`는 값 의미를 새로 부여하지 않고 기존 initializer value를 유지한다.

## 리스크

- Metrics `lastUpdate`를 누락하면 public read/write shape가 축소된다.
- BaseState/BaseMetrics와 중복된 필드를 제거하면 System 밖의 consumers가 깨진다.
- bridge alias/wrapper를 만들면 core/bridge export-star가 다른 symbol을 노출해 TS2308 충돌이나 declaration drift가 생길 수 있다.
- 타입 이동과 함께 factory/reset/timestamp를 교정하면 runtime identity와 lifecycle 회귀를 숨길 수 있다.
- package probe가 이름만 참조하면 requiredness와 nested field drift를 놓칠 수 있다.

## 검증

- 변경 source/test/script ESLint, generated probe syntax와 `git diff --check`.
- `InteractionSystem`, `InteractionBridge`, `AbstractSystem`, input single-source와 architecture/public/package focused Jest.
- interactions domain Jest.
- build/root TypeScript.
- 전체 Jest.
- fresh package ESM/CJS declarations, exact optional matrices, runtime smoke와 Vite consumer bundle.
- schema boundary/runtime non-regression reviewer 감사.

## 완료 조건

- [x] aggregate 세 schema가 core에 한 번만 정의되고 bridge는 같은 symbol만 re-export한다.
- [x] public State/Config/Metrics full shape와 Metrics required `lastUpdate`가 유지된다.
- [x] `InteractionSystem`의 bridge dependency가 사라지고 exact architecture baseline이 16개다.
- [x] root와 bridge의 기존 aggregate 타입 소비가 컴파일된다.
- [x] runtime initializer/reset/update/snapshot code에는 의미 변경이 없다.
- [x] focused/domain/type/public/package/full 검증과 reviewer 결과를 기록한다.
- [x] `HARNESS.md`를 append하고 plan을 completed로 이동한다.

## 구현 결과

- `InteractionState`, `InteractionConfig`, `InteractionMetrics`를 `core/types.ts`의 canonical interface로 통합했다.
- bridge는 canonical original symbol을 import하고 direct type re-export해 기존 bridge/root 소비 경로와 declaration identity를 유지한다.
- `InteractionSystem`의 모든 interaction type import를 `./types`로 통일해 interactions domain의 마지막 bridge upward edge를 제거했다.
- architecture exact baseline을 17에서 16으로 낮췄다.
- ESM/CJS package probe가 세 aggregate schema의 full nested shape, required timestamps, positive values와 exact assignability를 검사한다.
- constructor, reset, update, input backend, snapshot과 store runtime body는 변경하지 않았다. `metrics.lastUpdate`의 dormant 의미도 그대로다.

## 검증 결과

- 변경 source/test/script ESLint, generated probe `node --check`, build/root TypeScript와 `git diff --check`: 통과.
- focused: 7 suites / 74 tests, interactions: 8 suites / 110 tests 통과.
- 전체 Jest: 196 suites / 1,796 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, strict declarations와 ESM/CJS runtime smoke 통과.
- Vite package consumer bundle: 648 modules 통과.
- 독립 최종 리뷰: blocker 0 / major 0 / minor 0.

## 실패·경고·미실행과 다음 slice

- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- Node 20/22, 비-Windows와 renderer/examples surface가 바뀌지 않아 demo gate는 미실행했다.
- 다음 slice는 `InteractionSystem` reset이 mutated raw input, metrics와 config를 그대로 보존하는 lifecycle 결함을 local default creators와 reset normalization으로 교정한다.
