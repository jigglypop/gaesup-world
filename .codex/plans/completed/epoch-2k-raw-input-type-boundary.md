# Epoch 2k: Raw Input Type Boundary

## 목표

`KeyboardState`, `MouseState`, `GamepadState`, `TouchState`의 중복 정의를 Layer 1 core의 단일 canonical schema로 통합하고, adapter와 `InteractionSystem`의 raw input 타입 bridge 의존을 제거해 architecture exact baseline을 19개에서 17개로 줄인다.

## 현재 상태

- core와 bridge가 raw input quartet을 각각 독립 정의한다.
- Keyboard/Gamepad/Touch 구조는 동일하지만 public bridge `MouseState`에만 `isLookAround?: boolean`이 있다.
- `isLookAround`는 이미 `InteractionSystem`과 adapter runtime에서 사용되므로 core 정의의 누락이 실제 domain drift다.
- adapter는 quartet 전체를 `../bridge`에서 import하고, `InteractionSystem`은 raw quartet과 aggregate `InteractionState/Config/Metrics`를 한 bridge import로 가져오며 Keyboard/Mouse를 bridge에서 다시 export한다.
- architecture baseline에는 이 경로가 adapter import-type, System import, System export-type의 세 edge로 기록되어 있다.

## 범위

- core quartet을 기존 public declaration kind와 동일한 canonical interface로 정의한다.
- core `MouseState`에 exact optional `isLookAround?: boolean`을 추가한다.
- bridge의 quartet 중복 정의를 제거하고 canonical original symbol을 내부 계약에 import하며 기존 bridge/root 경로로 direct type re-export한다.
- adapter는 quartet을 `./types`에서 type-import한다.
- `InteractionSystem`은 raw quartet을 `./types`에서, 아직 bridge 소유인 aggregate 3종만 별도의 전체 `import type`으로 가져온다.
- `InteractionSystem`의 Keyboard/Mouse compatibility export는 canonical core symbol을 직접 재노출한다.
- core barrel은 quartet만 명시적으로 type-export한다.
- architecture baseline에서 기존 세 edge를 제거하고 aggregate type-only edge 하나만 추가해 19개에서 17개로 낮춘다.
- package consumer ESM/CJS에서 quartet의 full shape, optionality, Three vector fields와 `MouseState.isLookAround`를 실제 값과 양방향 assignability로 검증한다.

## 제외 범위

- `InteractionState`, `InteractionConfig`, `InteractionMetrics`의 canonical 이동은 다음 aggregate boundary epoch로 분리한다.
- `BridgeState`, `InteractionPayload`, command/event/snapshot 타입은 변경하지 않는다.
- Zustand/system input write path, backend routing, input event와 runtime 처리 순서는 변경하지 않는다.
- broad consumer import 경로를 기계적으로 바꾸지 않고 기존 bridge와 `InteractionSystem` 경로를 compatibility 소비자로 유지한다.
- 새 package subpath와 runtime export는 추가하지 않는다.
- root export-star 직접 module augmentation은 원선언과 병합되지 않으므로 package 계약으로 주장하거나 probe하지 않는다.

## Source of Truth

- `src/core/interactions/core/types.ts`의 네 canonical interface가 raw input schema의 유일한 정의다.
- `bridge/types.ts`는 같은 original symbol을 사용하는 compatibility projection이다.
- `MouseState.isLookAround`은 optional public input state이며 omission과 explicit boolean을 구분하는 exact optional 계약을 유지한다.
- aggregate interaction schema는 이번 slice 동안 bridge가 public compatibility source이고 core의 기존 aggregate 중복은 후속 migration 대상이다.

## 호환성 계약

- quartet 이름, 필드, nested field, optionality와 Three.js value types를 유지한다.
- root, bridge와 `InteractionSystem`의 기존 type import 경로를 유지한다.
- quartet은 기존 public interface declaration kind를 canonical origin에서 유지한다.
- input reset/update/snapshot, adapter/backend와 runtime JS observable behavior는 바뀌지 않는다.

## 리스크

- core/bridge가 서로 다른 alias나 wrapper symbol을 export하면 interactions export-star가 TS2308로 충돌할 수 있다.
- `isLookAround`를 required 또는 `boolean | undefined`로 정의하면 `exactOptionalPropertyTypes`에서 기존 optional 계약이 달라진다.
- aggregate import를 value import로 남기면 runtime edge가 유지되고 architecture baseline kind가 기대와 달라진다.
- raw quartet package probe가 이름만 참조하면 필드 삭제·optional drift를 놓칠 수 있다.

## 검증

- 변경 source/test/script ESLint, generated probe syntax와 `git diff --check`.
- adapter, `InteractionSystem`, `InteractionBridge`, input single-source와 architecture/public/package focused Jest.
- interactions domain Jest.
- build/root TypeScript.
- 전체 Jest.
- fresh package ESM/CJS declarations, runtime smoke와 Vite consumer bundle.
- domain boundary/public compatibility reviewer 감사.

## 완료 조건

- [x] raw input quartet이 core에 한 번만 정의되고 bridge는 같은 symbol만 re-export한다.
- [x] `MouseState.isLookAround?: boolean`의 exact optional public shape가 유지된다.
- [x] adapter raw edge와 System raw import/re-export edge가 사라지고 exact architecture baseline이 17개다.
- [x] root/bridge/InteractionSystem의 기존 quartet 타입 소비가 컴파일된다.
- [x] focused/domain/type/public/package/full 검증과 reviewer 결과를 기록한다.
- [x] `HARNESS.md`를 append하고 plan을 completed로 이동한다.

## 구현 결과

1. raw input quartet을 core의 canonical interface로 전환하고 public bridge에만 있던 `MouseState.isLookAround?: boolean`을 exact optional field로 흡수했다.
2. bridge의 quartet 중복 interface를 제거했다. bridge 내부 계약은 canonical symbol을 import하고 기존 bridge/root 경로는 같은 original symbol을 direct type re-export한다.
3. adapter는 quartet을 `./types`에서 가져오며, `InteractionSystem`은 quartet을 core에서 가져오고 aggregate `InteractionState/Config/Metrics`만 bridge에서 별도 type-import한다.
4. `InteractionSystem`의 Keyboard/Mouse compatibility export와 core barrel은 canonical original symbol을 명시적으로 재노출한다.
5. architecture의 기존 adapter import-type, System value import와 System export-type 세 edge를 제거하고 aggregate import-type 한 건만 남겨 exact baseline을 19에서 17로 줄였다.
6. ESM/CJS package consumer는 quartet의 양방향 full shape, Vector2/Vector3, nested fields, minimal Mouse omission과 boolean 값을 공통 probe로 검증한다. exact optional true는 explicit undefined를 거부하고 false는 이를 허용하는 별도 ESM/CJS fixture를 실제 컴파일한다.

## Source of Truth와 compatibility 결과

- raw input schema source는 `src/core/interactions/core/types.ts`, bridge는 같은 declaration identity를 재노출하는 compatibility projection이다.
- quartet의 기존 이름, nested fields, interface declaration kind, root/bridge/InteractionSystem import 경로를 유지했다.
- `isLookAround`은 omission 가능한 boolean이며 required나 `boolean | undefined`로 widen하지 않았다.
- aggregate interaction schema의 public compatibility source는 이번 slice 동안 bridge에 남고 다음 epoch에서 이동한다.
- compiled runtime JS는 import/export 이동 전후 동일하며 input update, adapter/backend, allocation과 resource lifetime 의미는 바뀌지 않았다.

## 검증 결과

- 변경 source/test/script ESLint, `node --check`, build/root TypeScript와 `git diff --check`: 통과.
- focused adapter/InteractionSystem/InteractionBridge/input-single-source/architecture/public/package: 7 suites / 76 tests 통과.
- interactions domain: 8 suites / 110 tests 통과.
- 전체 Jest: 196 suites / 1,796 tests 통과, 1 suite / 1 test skipped.
- fresh package source build: ESM/CJS 각각 916 modules, npm consumer 95 packages와 strict declaration graph 통과.
- current consumer matrix: exact optional true ESM/CJS, false ESM/CJS, ESM/CJS runtime smoke와 648-module Vite bundle 통과.
- mutation 감사는 field/nested/optional/Vector widening·narrowing drift를 검출했다.
- 독립 최종 재검토: blocker 0 / major 0 / minor 0.

## 실패·경고·미실행과 다음 slice

- 최초 reviewer가 package consumer 전체는 exact optional true만 실행되고 false/true loop는 package declaration만 검사하는 minor를 찾았다. 별도 exact=false ESM/CJS fixture와 positive explicit-undefined probe를 추가해 수정 후 재검증했다.
- 마지막 clean `test:package`는 모든 타입 검사, smoke와 Vite bundle 출력을 완료한 뒤 Windows Node 24 libuv `UV_HANDLE_CLOSING` assertion으로 한 차례 비정상 종료했다. 같은 fresh dist의 전체 consumer 단계를 재실행해 정상 통과했으며 worker의 앞선 clean run도 통과했다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- Node 20/22와 비-Windows package 실행은 이번 환경에서 미실행했다.
- renderer/examples surface가 바뀌지 않아 demo gate는 미실행했다.
- 다음 slice는 aggregate `InteractionState`, `InteractionConfig`, `InteractionMetrics` schema를 core로 이동해 마지막 interactions type edge를 제거하고 exact baseline을 17에서 16으로 줄인다.
