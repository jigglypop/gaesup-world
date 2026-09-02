# Epoch 2f: Motion State Isolation

## 목표

`MotionSystem`의 mutable Three.js 상태와 metrics를 인스턴스별로 소유하게 하고, reset이 현재 변형값이 아니라 해당 인스턴스의 구성 seed를 기준으로 새 상태를 만들게 한다.

## 현재 상태

- `MotionSystem`의 module-level `defaultState`와 `defaultMetrics`가 `Vector3`/`Euler` 인스턴스를 공유한다.
- `AbstractSystem`은 object default를 shallow spread하므로 여러 `MotionSystem`이 같은 nested mutable 객체를 가진다.
- `AbstractSystem.reset()`은 현재 state/metrics를 다시 seed로 사용해 변형된 scalar와 객체 값을 보존한다.
- `MotionBridge` snapshot은 엔진 상태와 별개의 entity별 cache이며 hot path에서 top-level 및 nested identity를 재사용한다.

## 범위

- `AbstractSystem`에 object 또는 initializer를 받는 additive initialization contract를 추가한다.
- 기존 object initializer 경로는 현재 reset semantics를 유지한다.
- initializer 경로는 constructor/reset마다 새 state/metrics를 materialize하며 reset의 state/metrics 교체는 예외에 대해 원자적으로 수행한다.
- `MotionSystem`의 state/metrics seed를 owned Three.js 객체를 만드는 factory로 전환한다.
- 인스턴스 격리, dispose 격리, configured seed reset, caller-owned Three.js 참조 비변형, update counter 초기화를 테스트한다.
- `MotionBridge` reset 이후에도 cached snapshot과 nested snapshot identity가 유지되고 값만 초기화되는 계약을 테스트한다.

## 제외 범위

- Animation, Interaction, Automation, Minimap, Physics system의 nested resource/reset 계약은 변경하지 않는다.
- generic deep clone을 도입하지 않는다.
- physics config/store source of truth, Rapier body port, frame hot-path allocation은 후속 epoch로 분리한다.
- `MotionBridge` public command/snapshot shape와 config persistence 의미는 변경하지 않는다.

## Source of Truth

- legacy object initializer를 사용하는 system은 기존처럼 현재 state/metrics 기반 reset을 유지한다.
- initializer를 사용하는 system은 initializer가 새 runtime state/metrics의 ownership boundary다.
- `MotionSystem`은 constructor에서 구성된 seed와 Motion 전용 factories가 reset 값 및 mutable Three.js 객체의 source of truth다.
- `MotionBridge`의 entity별 snapshot cache가 consumer-visible snapshot identity의 source of truth이며 engine reset은 이를 교체하지 않는다.

## 호환성 전략

- `AbstractSystem`의 기존 object constructor 호출은 그대로 컴파일되고 동작한다.
- initializer function은 additive opt-in이며 이번 slice에서는 `MotionSystem`만 사용한다.
- `MotionSystem`의 public constructor/options, state, metrics, bridge command/snapshot shape는 유지한다.
- reset 시 Motion engine state/nested identity는 새로 만들어지지만 consumer-visible bridge snapshot/nested identity와 config 객체는 유지한다.

## 리스크

- function/object 분기 판별이나 override precedence가 기존 `default < initial override < lastUpdate/frameTime zero` 계약을 깨뜨릴 수 있다.
- state factory 성공 후 metrics factory가 실패하면 partial reset이 발생할 수 있다.
- reset이 bridge cache를 교체하면 frame hot-path identity 계약과 subscribers가 깨질 수 있다.
- caller가 제공한 `Vector3`/`Euler`를 그대로 채택하면 외부 소유 객체를 system mutation/dispose가 오염시킬 수 있다.

## 검증

- 변경 source ESLint와 신규/변경 test `--no-ignore` ESLint.
- `AbstractSystem`, `MotionSystem`, `MotionBridge` focused Jest.
- motions 및 boilerplate 관련 domain Jest.
- `corepack pnpm exec tsc -p tsconfig.build.json --noEmit`와 `corepack pnpm exec tsc --noEmit`.
- public API/package export focused Jest와 `corepack pnpm run test:package`.
- 전체 Jest, `git diff --check`, 독립 reviewer 감사.

## 완료 조건

- [x] 두 `MotionSystem`이 모든 mutable state/metrics 참조를 공유하지 않고 한 인스턴스의 mutation/dispose가 다른 인스턴스에 전파되지 않는다.
- [x] Motion reset이 configured scalar/Three.js seed를 fresh owned refs로 복원하고 counters/timestamps를 초기화한다.
- [x] legacy object initializer 파생 클래스의 reset semantics가 보존되고 initializer reset의 state/metrics assign이 원자적이다.
- [x] MotionBridge reset이 engine 값을 초기화하면서 cached snapshot top-level/nested identity와 config를 보존한다.
- [x] focused/domain/type/public/package/full 검증 결과를 기록한다.
- [x] 독립 검토를 통과하고 `HARNESS.md`에 append한다.

## 구현 결과

- `AbstractSystem` constructor가 기존 object와 additive initializer function을 모두 받는다. object reset은 current state/metrics를 source로 삼는 legacy 의미를 유지하고, function reset만 fresh seed를 materialize한다.
- reset은 next state와 metrics를 모두 만든 뒤 assign해 metrics initializer 실패 시 state만 교체되는 partial reset을 차단한다. base timestamp와 update counter 규칙은 유지한다.
- `MotionSystem`은 constructor 시점 scalar/Three seed를 closure에 owned copy로 보관하고 construct/reset마다 새 `Vector3`/`Euler`를 만든다. caller object와 live state가 이후 변해도 reset seed는 흔들리지 않는다.
- mixed ESM/CJS와 duplicate Three에서도 유효한 seed를 보존하도록 constructor identity가 아니라 Three brand, numeric component와 Euler order를 검사하고 로컬 Three constructor로 복사한다.
- `MotionBridge` source는 바꾸지 않고 public register/execute/snapshot/subscribe 경로의 reset identity 계약을 신규 test로 고정했다.

## 최종 검증 결과

- 변경 source/test ESLint(`--no-ignore` 포함): 0 errors / 0 warnings.
- focused AbstractSystem/MotionSystem/MotionBridge: 3 suites / 25 tests 통과.
- motions+boilerplate domain: 36 suites / 503 tests 통과.
- public API/package exports: 2 suites / 22 tests 통과.
- build/root TypeScript: 통과.
- 전체 Jest: 193 suites / 1,764 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각 915 modules, npm consumer 95 packages, ESM/CJS runtime smoke와 648-module Vite consumer bundle 통과.
- `git diff --check`: 통과. 기존 worktree의 LF→CRLF 안내만 출력됐다.
- 독립 재검토: blocker 0 / major 0 / minor 0.

## 실패·경고·미실행과 후속 debt

- 최초 독립 검토에서 `instanceof THREE.Vector3/Euler`가 mixed ESM/CJS seed를 영값으로 바꾸는 minor 1건을 재현했다. brand/structure guard와 foreign-prototype regression으로 수정한 뒤 관련 모든 gate와 재검토를 다시 통과했다.
- 기존 duplicate Three, React 19 `react-test-renderer` deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 non-failing debt로 남는다.
- renderer/examples surface가 바뀌지 않아 `test:demo`는 실행하지 않았다.
- legacy object initializer를 쓰는 Animation, Interaction, Automation, Minimap과 Physics의 nested reset/resource 계약은 의도적으로 유지했다.
- 다음 slice는 physics configuration의 store/bridge/system source of truth와 child config propagation을 감사·교정한다.
