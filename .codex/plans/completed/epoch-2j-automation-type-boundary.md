# Epoch 2j: Automation Type Boundary

## 목표

`AutomationAction`, `AutomationSettings`, `AutomationState`, `AutomationConfig`, `AutomationMetrics`의 중복 정의를 `src/core/interactions/core/types.ts`의 단일 canonical schema로 통합하고, Layer 1 `AutomationSystem`이 Layer 2 bridge 타입을 참조하는 upward edge를 제거한다.

## 현재 상태

- `core/types.ts`와 `bridge/types.ts`가 automation schema를 각각 독립 정의한다.
- `AutomationSystem.ts`가 `../bridge/types`를 import해 architecture baseline에 Layer 1 → Layer 2 위반 한 건으로 기록되어 있다.
- 현재 root public automation 타입은 `bridge/types.ts`가 `bridge/index.ts`를 통해 노출하는 interface 정의다.
- core의 `AutomationAction.data`는 `RuntimeRecord`라 bigint/symbol을 허용하지만 현재 public bridge 계약은 `Record<string, InteractionPayload>`라 bigint/symbol을 허용하지 않는다.
- core와 bridge의 다른 interaction/input 타입은 `MouseState.isLookAround`, `InteractionMetrics.lastUpdate` 등 실제 구조 차이가 있어 이번 slice에서 합칠 수 없다.

## 범위

- public bridge 계약과 동일한 automation payload value union을 core schema에 둔다.
- core에 named `AutomationSettings`를 추가하고 automation state의 inline settings를 이 타입으로 정규화한다.
- `AutomationSystem`은 canonical core automation 타입만 import한다.
- core barrel은 canonical automation 타입 다섯 개만 명시적으로 type-export한다.
- bridge는 automation 타입 자체를 재정의하지 않고 canonical symbol을 import해 내부 bridge 계약에 사용하며, 기존 bridge/root import 호환성을 위해 같은 다섯 symbol을 type re-export한다.
- architecture baseline에서 해소된 정확한 upward edge 한 건을 제거하고 총 baseline을 20개에서 19개로 낮춘다.
- package consumer ESM/CJS 타입 probe로 다섯 root 타입과 `AutomationAction.data`의 bigint/symbol 비허용을 고정한다.

## 제외 범위

- `InteractionSystem`, adapter와 input/interaction core → bridge upward edge는 별도 boundary epoch로 분리한다.
- `KeyboardState`, `MouseState`, `GamepadState`, `TouchState`, `InteractionState`, `InteractionConfig`, `InteractionMetrics`, `InteractionPayload`의 전체 domain migration은 하지 않는다.
- automation queue write path, Zustand/system 이중 상태와 queue semantics는 변경하지 않는다.
- `AutomationSystem` 실행 순서, lifecycle, 이벤트와 runtime 동작은 변경하지 않는다.
- 새 package subpath 또는 runtime export는 추가하지 않는다.

## Source of Truth

- `src/core/interactions/core/types.ts`의 다섯 canonical automation interface가 automation schema의 유일한 정의다.
- `bridge/types.ts`는 canonical 타입을 소비하고 re-export하는 compatibility boundary이며 별도 automation schema를 소유하지 않는다.
- 기존 `gaesup-world` root 및 내부 `bridge/types` import 경로는 같은 canonical symbol을 계속 제공한다.
- `AutomationAction.data`는 현재 public 계약대로 bigint/symbol을 제외한 serializable-adjacent value union을 유지한다.

## 호환성 계약

- 다섯 automation 타입 이름과 필드, optionality, action discriminant, callback signature와 payload assignability를 유지한다.
- 기존 declaration kind는 canonical original symbol에서 유지한다. 이는 새 데이터 타입에 type alias를 우선하는 규칙보다 이미 배포된 declaration shape를 보존하기 위한 명시적 migration 예외다.
- root package와 기존 bridge import 경로를 유지한다.
- automation runtime JS export와 실행 observable behavior는 바뀌지 않는다.
- `BaseState.lastUpdate`와 `BaseMetrics.frameTime`은 `AutomationSystem`의 local intersection으로 남고 public automation state/metrics에는 추가하지 않는다.

## 리스크

- core와 bridge의 export-star가 같은 이름을 서로 다른 symbol로 내보내면 root declaration export가 ambiguous해질 수 있다.
- canonical action payload를 기존 core `RuntimeRecord`로 유지하면 public 타입이 bigint/symbol까지 widen되어 read-side source compatibility가 깨질 수 있다.
- canonical schema를 type alias로 바꾸면 declaration kind가 바뀐다. 다섯 타입의 기존 interface kind를 core에서 보존하고 bridge가 같은 original symbol을 직접 re-export해야 한다. 단, root export-star를 대상으로 한 module augmentation은 원선언과 병합되지 않고 새 root interface를 가리므로 지원되는 기존 계약으로 간주하지 않는다.
- package ESM/CJS declaration graph 중 한쪽만 갱신되면 publish consumer에서 타입 drift가 발생할 수 있다.

## 검증

- 변경 source와 test/script ESLint 및 `git diff --check`.
- `AutomationSystem`, interactions domain과 architecture/public/package exports focused Jest.
- `corepack pnpm exec tsc -p tsconfig.build.json --noEmit` 및 root `tsc --noEmit`.
- 전체 Jest.
- fresh package ESM/CJS declaration consumer, runtime smoke와 Vite consumer bundle.
- domain boundary/public compatibility reviewer 감사.

## 완료 조건

- [x] 다섯 automation schema가 core에 한 번만 정의되고 bridge는 같은 symbol만 re-export한다.
- [x] `AutomationSystem`의 Layer 1 → bridge upward edge가 사라지고 exact architecture baseline이 19개다.
- [x] root와 bridge 경로의 기존 automation 타입 소비가 컴파일된다.
- [x] `AutomationAction.data`가 bigint/symbol을 계속 거부한다.
- [x] focused/domain/type/public/package/full 검증과 reviewer 결과를 기록한다.
- [x] `HARNESS.md`를 append하고 plan을 completed로 이동한다.

## 구현 결과

1. `core/types.ts`가 다섯 automation interface의 단일 원선언을 소유한다. `AutomationSettings`를 named schema로 추가하고 queue helper는 비공개로 유지했으며 action data는 기존 public `InteractionPayload`와 동일한 value union을 사용한다.
2. `bridge/types.ts`의 다섯 중복 interface를 제거했다. bridge command/snapshot은 canonical symbol을 import하고 기존 bridge/root 경로는 원선언을 direct type re-export한다.
3. `AutomationSystem`은 `./types`만 type-import해 runtime JS를 바꾸지 않고 Layer 1 → bridge edge 한 건을 제거했다.
4. core barrel은 다섯 canonical 타입만 명시적으로 type-export한다. input/aggregate 타입은 노출하지 않아 core/bridge export-star 충돌을 피했다.
5. architecture exact baseline은 20개에서 19개로 감소했다.
6. package consumer는 ESM/CJS 양쪽에서 다섯 타입의 양방향 full-shape, minimal/full action optionality, 모든 discriminant, callback 호출, 허용 payload 값과 bigint/symbol 거부를 컴파일한다.

## Source of Truth와 compatibility 결과

- canonical source는 `src/core/interactions/core/types.ts`, bridge는 compatibility projection이다. TypeScript checker로 core, bridge와 root barrel의 다섯 export가 같은 declaration identity를 가리키는 것을 확인했다.
- 기존 타입 이름, 필드, optionality, callback, discriminant와 root/bridge import 경로를 유지했다.
- 기존 public interface declaration kind는 canonical origin에서 유지한다. root export-star를 직접 대상으로 한 module augmentation은 원선언과 병합되지 않으므로 지원 계약으로 주장하지 않는다.
- `BaseState.lastUpdate`와 `BaseMetrics.frameTime`은 system-local intersection에만 남고 automation public state/metrics에는 추가하지 않았다.
- runtime method, queue, event와 lifecycle 동작은 변경하지 않았다.

## 검증 결과

- 변경 source/test/script ESLint와 `node --check`: 통과.
- root focused architecture/Automation/InteractionBridge/public/package: 6 suites / 102 tests 통과.
- interactions domain: 8 suites / 110 tests 통과.
- build/root TypeScript와 `git diff --check`: 통과.
- 전체 Jest: 196 suites / 1,796 tests 통과, 1 suite / 1 test skipped.
- 최종 fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, strict declaration graph, ESM/CJS runtime smoke와 648-module Vite consumer bundle 통과.
- package probe mutation 감사: baseline 0 errors, `AutomationAction.data` 삭제는 unsuppressed 1 error, string-only 축소는 7 errors.
- 독립 최종 검토: blocker 0 / major 0. 문서 오기 minor는 수정했고 2c에서 유입된 temp-dir 초기 parse cleanup minor만 후속 debt로 분리했다.

## 실패·경고·미실행과 다음 slice

- 최초 package probe에서 root barrel `AutomationAction` augmentation을 원선언 병합으로 잘못 가정해 consumer import가 가려졌다. 비지원 주장을 제거한 뒤 clean package gate를 재실행해 통과했다.
- reviewer가 negative indexed-access만으로는 `data` 삭제도 `@ts-expect-error`에 숨을 수 있는 major를 재현했다. ESM/CJS 공통 exact/positive probe와 mutation 감사로 수정 후 재검증했다.
- verifier가 package JSON을 읽기 전에 temp directory를 만드는 기존 2c cleanup edge는 초기 parse 실패 때 directory를 남길 수 있다. automation boundary와 분리해 후속 quality slice에서 정리한다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- Node 20/22와 비-Windows package 실행은 이번 환경에서 미실행했다.
- renderer/examples surface가 바뀌지 않아 demo gate는 미실행했다.
- 다음 slice는 raw input quartet(`KeyboardState`, `MouseState`, `GamepadState`, `TouchState`)을 canonical core interface로 이동하고 architecture baseline을 19에서 17로 줄인다.
