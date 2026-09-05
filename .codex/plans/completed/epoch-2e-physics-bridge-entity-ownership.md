# Epoch 2e: Physics Bridge Entity Ownership

## 목표

공유 `MotionsRuntime`/`PhysicsBridge`에서 여러 `usePhysicsBridge` 소비자가 고정 ID `global-physics`를 덮어쓰고 서로의 engine을 dispose하는 결함을 entity별 ownership으로 교정한다.

## 현재 상태

- `useEntity`는 mount 동안 안정적인 `entityId`를 만들고 MotionBridge에는 전달하지만 PhysicsBridge 호출에서 잃는다.
- `usePhysicsBridge`의 register, update, command와 unregister가 모두 `global-physics`를 사용한다.
- 같은 bridge의 두 번째 mount는 첫 `PhysicsSystem`을 dispose하고, 첫 번째 unmount는 두 번째 engine까지 제거한다.
- legacy fallback runtime은 module singleton이고 injected runtime/bridge factory도 공유 instance를 공식적으로 허용하므로 production에서 재현 가능하다.

## 범위

- `UsePhysicsBridgeOptions`에 optional `entityId`를 추가한다.
- `useEntity`가 이미 소유한 stable ID를 motion과 physics 양쪽에 동일하게 전달한다.
- 직접 `usePhysicsBridge` 소비자는 React lifecycle에서 안정적인 고유 fallback ID를 사용한다.
- registration effect가 자신이 등록한 bridge와 ID를 캡처해 runtime swap, disabled transition과 unmount에서 자기 engine만 정리한다.
- shared runtime multi-entity, fallback ID, rerender/runtime swap, StrictMode와 frame/command ID 일치를 executable lifecycle test로 고정한다.

## 제외 범위

- `PhysicsBridge`/`AbstractBridge`의 public command shape와 engine implementation은 변경하지 않는다.
- 명시적으로 동일한 `entityId`를 두 활성 consumer가 전달하는 caller 오류를 자동 namespacing하지 않는다.
- `MotionSystem` mutable default, physics config/store 경계, Rapier body port와 hot-path allocation은 후속 epoch로 분리한다.

## Source of Truth

- `useEntity`의 stable `entityId`가 한 entity의 MotionBridge와 PhysicsBridge ownership key다.
- 직접 hook 소비에서는 hook instance가 생성한 stable ID가 engine ownership key다.
- 각 registration effect는 등록 시 캡처한 exact bridge/ID pair만 unregister한다. runtime ref의 최신 값은 과거 ownership cleanup의 source of truth가 아니다.

## 호환성 전략

기존 `usePhysicsBridge(options)` 호출과 `PhysicsEntity` props는 그대로 유효하다. `entityId`는 additive optional field이며 기존 public export/subpath를 변경하지 않는다. 공유되지 않는 runtime의 동작도 유지한다.

## 리스크

- React StrictMode effect replay에서 ID가 달라지거나 cleanup이 새 registration을 제거할 수 있다.
- runtime 교체 시 mutable bridge ref를 cleanup에 사용하면 이전 bridge의 engine이 누수된다.
- config effect와 frame callback이 registration과 다른 ID를 사용하면 silent no-op 또는 다른 engine mutation이 발생한다.

## 검증

- 변경 source ESLint와 신규 test `--no-ignore` ESLint.
- ownership/useEntity/ref lifecycle focused Jest.
- motions와 boilerplate hook 관련 domain Jest.
- `corepack pnpm exec tsc -p tsconfig.build.json --noEmit` 및 `corepack pnpm exec tsc --noEmit`.
- public API/package export focused Jest. additive public declaration이므로 `test:package` consumer compile/runtime gate.
- `git diff --check`.

## 완료 조건

- [x] 같은 runtime에 두 entity engine이 동시에 존재하고 한쪽 unmount가 다른 engine을 제거하지 않는다.
- [x] `useEntity`가 motion/physics에 동일한 stable ID를 전달한다.
- [x] direct hook fallback ID가 instance별 고유하고 rerender/StrictMode 동안 안정적이다.
- [x] runtime swap, enabled transition, command/config/frame update와 cleanup이 같은 captured ID를 사용한다.
- [x] focused/domain/type/public/package 검증 결과를 기록한다.
- [x] 독립 검토를 통과하고 `HARNESS.md`에 append한다.

## 구현 결과

- `UsePhysicsBridgeOptions`에 additive optional `entityId`를 추가하고 `useEntity`가 기존 mount-stable ID를 MotionBridge와 PhysicsBridge 양쪽에 전달한다.
- 직접 hook 소비자는 React `useId()`와 module-local mount nonce를 결합한 stable fallback key를 가진다. 같은 React tree뿐 아니라 동일 `identifierPrefix`를 쓰는 여러 root에서도 공유 fallback bridge key가 충돌하지 않는다.
- boolean registration 상태를 exact `{ bridge, entityId }` ownership record로 교체했다. registration effect cleanup은 캡처한 exact pair만 unregister하고 현재 record와 일치할 때만 refs/state를 비운다.
- config command와 frame update는 current registration pair를 사용해 runtime swap과 enabled transition 뒤에도 register/execute/update/unregister key가 일치한다.
- 실제 `PhysicsBridge`를 공유하는 lifecycle test가 두 engine coexistence, 독립 unmount, fallback uniqueness, StrictMode effect replay, rerender, runtime/enable 전환과 old/new bridge command/frame routing을 검증한다. 정적 guard는 `global-physics` 문자열 재유입을 거부한다.
- fresh package consumer가 public `UsePhysicsBridgeOptions`와 `entityId`를 직접 컴파일한다.

## 최종 검증 결과

- 변경 source/script ESLint 및 신규/기존 test `--no-ignore` ESLint: 0 errors / 0 warnings.
- focused ownership/useEntity/ref: 3 suites / 14 tests 통과.
- `corepack pnpm test -- src/core/motions src/core/boilerplate/hooks --runInBand`: 20 suites / 239 tests 통과.
- public API/package exports: 2 suites / 22 tests 통과.
- build/root TypeScript: 통과.
- `corepack pnpm run test:package`: fresh ESM/CJS 각 915 modules, npm consumer 95 packages, ESM/CJS declaration/runtime와 648-module Vite consumer bundle 통과.
- `git diff --check`: 통과. 기존 worktree의 LF→CRLF 안내만 출력됐다.
- 독립 lifecycle 및 API/test 재검토: blocker, major, minor 없음.

## 실패·미실행과 잔여 debt

- 최초 신규 `useEntity` test `--no-ignore` lint가 import-order 2건으로 실패했고 import group을 교정한 뒤 재검증했다.
- 일반 StrictMode wrapper는 현재 Testing Library 설정에서 effect replay를 만들지 않아 count assertion이 한 차례 실패했다. 공식 `reactStrictMode: true` option으로 교체해 replay 2회 이상과 동일 ownership ID를 검증했다.
- 첫 fresh package 재실행의 `npm pack`이 실제 존재하는 일부 root `.d.cts`를 tarball에서 일시 누락했다. 동일 built graph의 consumer gate가 통과했고, 이후 전체 `test:package`를 다시 실행해 build부터 consumer bundle까지 최종 통과했다.
- domain test의 duplicate Three instance warning과 package consumer의 large chunk warning은 기존 non-failing warning이다.
- 전체 Jest와 `test:demo`는 실행하지 않았다. renderer/examples surface는 바뀌지 않았고 focused domain/public/fresh package gate를 선택했다.
- 명시적으로 같은 `entityId`를 둘 이상의 활성 caller가 전달하면 기존 overwrite 계약이 유지된다. 다음 epoch는 `MotionSystem` mutable state/reset seed isolation을 다룬다.
