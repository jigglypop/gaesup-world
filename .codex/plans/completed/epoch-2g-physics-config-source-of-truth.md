# Epoch 2g: Physics Config Source of Truth

## 목표

physics config 타입과 runtime mutation 경계를 motions core로 내리고, store 또는 runtime 변경 이후 parent `PhysicsSystem`과 Direction/Impulse/Gravity child가 같은 최신 config를 사용하게 한다.

## 현재 상태

- `PhysicsConfigType`은 React/Zustand integration 계층인 `stores/slices/physics/types.ts`가 소유한다.
- `PhysicsBridge` 1곳과 motions Layer 1 core 8곳이 store 타입을 위쪽으로 import해 local upward-edge baseline 29개 중 9개를 만든다.
- `PhysicsSystem` constructor는 caller config 객체를 parent와 세 child가 공유하지만 `updateConfig()`는 parent의 `this.config`만 새 객체로 교체한다.
- 이후 parent damping은 최신 값을 쓰는 반면 Direction, Impulse와 Gravity는 생성 당시 walk/run/jump/gravity/maxSpeed/accelRatio를 계속 사용한다.
- `usePhysicsBridge`의 registration seed ref는 registration 중 store가 바뀌면 갱신되지 않아 runtime swap/re-enable 때 최초 config를 register한다. 뒤따르는 full update command가 parent만 교정해 child stale 문제를 숨긴다.

## 범위

- canonical `PhysicsConfigType`을 `src/core/motions/core/config.ts`에 정의하고 motions core가 local/downward 경로만 사용하게 한다.
- 기존 store physics type 경로는 canonical type의 compatibility re-export로 유지한다.
- PhysicsSystem은 constructor 시점에 caller와 분리된 하나의 stable config object를 소유하고 세 child에 같은 object를 전달한다.
- `updateConfig()`는 stable object를 in-place patch하고 known Three.js vector 값은 로컬 owned copy로 보관한다.
- `usePhysicsBridge` registration은 render 시점 latest config ref를 seed로 사용하며 기존 full update command를 유지한다.
- store의 기존 numeric defaults는 유지하되 singleton object/Vector3 대신 fresh factory로 main/dormant store 초기화와 reset을 소유하게 하고, 이미 존재하는 `resetPhysics` action을 타입에 반영한다.
- architecture exact baseline에서 제거된 9개 store-config edge와 기대 개수 29→20을 함께 갱신한다.
- child propagation, caller ownership, hook store update/runtime swap seed와 public type compatibility를 executable test로 고정한다.

## 제외 범위

- `ModeType`, world/Rideable, controller와 Rapier upward dependency는 이동하지 않는다.
- `PhysicsConfigType`의 optional fields 또는 Three.js `Vector3` public shape를 serializable engine-neutral schema로 바꾸지 않는다.
- physics store의 product preset/default 값과 UI write path는 유지한다.
- Rapier body port, physics algorithm, navigation behavior, frame hot-path 구조는 변경하지 않는다.
- Automation timer, AbstractBridge exception cleanup과 다른 system reset은 후속 epoch로 분리한다.

## Source of Truth

- config schema/type source of truth는 motions Layer 1 `core/config.ts`다. store path는 compatibility projection이다.
- 각 entity의 `PhysicsSystem` stable owned config object가 runtime calculation의 canonical value다.
- bridge `updateConfig` command가 live engine config의 canonical write path이며 child components는 같은 stable object를 읽는다.
- Zustand physics slice는 application-level desired config이며 hook은 latest full value를 registration seed와 update command로 projection한다.
- 각 physics store instance/reset은 같은 default 수치를 가진 새 config와 새 nested Vector3를 materialize한다.

## 호환성 전략

- root와 기존 store re-export의 `PhysicsConfigType` 이름·shape를 유지한다.
- `PhysicsBridge.register`, `PhysicsCommand`, `UsePhysicsBridgeOptions`, store actions와 PhysicsSystem constructor signature를 유지한다.
- config object identity에 의존하는 외부 계약은 없으며 caller config와 nested vector identity는 더 이상 engine이 채택하지 않는다.
- runtime config update는 의도적으로 모든 child 계산에 즉시 반영된다.

## 리스크

- root wildcard exports가 canonical type과 compatibility re-export를 중복 노출해 declaration ambiguity를 만들 수 있다.
- stable in-place mutation이 caller/store 객체까지 전파되면 source-of-truth가 다시 분산된다.
- singleton default와 nested Vector3가 main/dormant store 또는 reset 사이에 다시 공유되면 store write path를 우회할 수 있다.
- hook effect ordering 또는 runtime swap에서 stale registration seed가 잠깐 child constructor에 들어갈 수 있다.
- test가 parent damping만 확인하면 child stale 결함을 놓칠 수 있다.
- architecture baseline만 줄이고 실제 import가 남거나 반대로 stale baseline을 남기면 gate가 실패한다.

## 검증

- 변경 source/script ESLint와 신규/변경 test `--no-ignore` ESLint.
- PhysicsSystem/PhysicsBridge/usePhysicsBridge/store focused Jest와 motions/store domain Jest.
- architecture boundary, public API와 package exports focused Jest.
- build/root TypeScript, `git diff --check`.
- fresh `test:package` declaration/ESM/CJS/Vite consumer gate와 전체 Jest.
- 독립 architecture/runtime reviewer 감사.

## 완료 조건

- [x] canonical config type이 motions core에 있고 기존 store/root 소비가 동일 shape로 컴파일된다.
- [x] local upward-edge exact baseline이 config 관련 9개를 실제 제거해 20개가 된다.
- [x] PhysicsSystem과 Direction/Impulse/Gravity가 constructor와 update 후 동일 owned stable config를 사용한다.
- [x] caller config/Vector3 mutation이 live engine에 전파되지 않고 bridge command만 latest 값을 쓴다.
- [x] hook store update, runtime swap/re-enable와 shared entity가 stale registration/child config를 만들지 않는다.
- [x] main/dormant physics store와 reset default가 top-level/nested mutable identity를 공유하지 않는다.
- [x] focused/domain/type/public/package/full 검증과 독립 review를 기록한다.
- [x] `HARNESS.md`를 append하고 plan을 completed로 이동한다.

## 구현 결과

- `PhysicsConfigType` source of truth를 motions Layer 1 `core/config.ts`로 옮기고 기존 store 경로는 동일 symbol의 compatibility type re-export로 유지했다.
- `PhysicsSystem`이 caller와 분리된 stable config 객체를 소유하고 두 Vector3를 복사하며 Direction, Impulse, Gravity child가 같은 객체를 읽도록 했다. `updateConfig`는 해당 객체를 in-place patch한다.
- `usePhysicsBridge`는 render-latest store config를 registration seed와 full update command에 사용해 runtime swap과 disable/re-enable에서 stale seed를 제거했다.
- physics store는 main/dormant instance와 reset마다 fresh config와 Vector3를 만들며, 기본값이 없는 네 optional key는 explicit `undefined` sentinel을 materialize해 live engine reset도 기존 값을 제거한다.
- config 관련 upward edge 9개를 제거해 exact baseline을 29에서 20으로 줄였고, ESM과 CJS package consumer가 root `PhysicsConfigType`을 직접 컴파일한다.

## 최종 검증 결과

- 변경 source/script와 test ESLint(`--no-ignore` 포함): 0 errors / 0 warnings.
- focused integration: 7 suites / 77 tests 통과. reviewer 수정 후 reset 경로 focused: 5 suites / 55 tests 통과.
- motions+stores domain: 16 suites / 132 tests 통과.
- public API/package exports: 2 suites / 22 tests 통과.
- build/root TypeScript: 통과.
- 전체 Jest: 194 suites / 1,769 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, strict declarations, ESM/CJS runtime smoke와 648-module Vite consumer bundle 통과.
- `git diff --check`: 통과. 기존 worktree의 LF→CRLF 안내만 출력됐다.
- 독립 재검토: blocker 0 / major 0 / minor 0.

## 실패·경고·미실행과 후속 debt

- 최초 리뷰의 CJS named type 직접 probe 공백과 live reset의 omitted optional key 잔존 문제를 각각 CJS namespace type probe와 explicit reset sentinel로 수정한 뒤 모든 관련 gate를 재실행했다.
- duplicate Three, React 19 `react-test-renderer` deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- renderer/examples surface가 바뀌지 않아 `test:demo`는 실행하지 않았다.
- 다음 slice는 첫 frame 이후 갱신되지 않는 `PhysicsState.modeType`과 `automationOption` lifecycle을 교정한다.
