# Epoch 2h: Live Physics Mode Projection

## 목표

동일 entity와 `PhysicsSystem` lifetime을 보존하면서 Zustand의 최신 mode와 automation state를 매 frame `PhysicsState`에 projection하고, character·vehicle·airplane 전환 시 이전 모드의 중력·방향·기울기·점프 transient가 다음 모드 계산으로 새지 않게 한다.

## 현재 상태

- `usePhysicsBridge`는 첫 frame에만 `modeType`과 `automationOption`을 `PhysicsState`에 캡처하고 이후 input, active/game state와 delta만 갱신한다.
- `useEntity`의 animation과 MotionBridge는 store mode 변경에 반응하지만 PhysicsBridge는 재등록되지 않아 visual/motion은 새 mode, physics는 최초 mode인 split-brain 상태가 된다.
- `calcProp.worldContext`는 이미 매 frame 최신 store를 읽으므로 `PhysicsState`와 같은 frame에 서로 다른 store snapshot을 볼 수 있다.
- airplane은 gravity scale을 적용하지만 vehicle 계산은 존재하는 vehicle gravity branch를 호출하지 않아 airplane→vehicle에서 낮은 gravity가 남을 수 있다.
- mode 전환 시 airplane pitch/roll과 direction/dir, jump latch가 retained state에 남아 다음 mode의 첫 frame에 사용될 수 있다.
- `automationOption`은 현재 production consumer가 없고 실제 automation은 최신 `calcProp.worldContext.automation`을 읽지만, root public `PhysicsState` contract는 stale하다.

## 범위

- `usePhysicsBridge`가 frame마다 store snapshot을 한 번만 읽고 state 생성, retained `PhysicsState.modeType`/`automationOption`, `calcProp.worldContext`에 같은 snapshot을 사용하게 한다.
- mode 변경만으로 bridge/system/state를 재등록하거나 재생성하지 않고 기존 entity identity, position, yaw, velocity와 metrics를 보존한다.
- `PhysicsSystem`이 retained state의 mode transition을 감지해 direction/dir, pitch/roll과 jump transient를 정규화하고 character의 inner-group yaw와 vehicle/airplane의 rigid-body yaw 사이 ownership을 transfer한다.
- vehicle frame도 `GravityComponent`의 vehicle branch를 호출해 이전 airplane gravity를 제거한다.
- hook projection identity와 character→vehicle→airplane→character 전환, automation latest identity, actual gravity/orientation/direction transition을 executable tests로 고정한다.

## 제외 범위

- `AutomationSystem`의 wait/retry timer cancellation, reset initializer와 SystemRegistry ownership은 다음 lifecycle epoch로 분리한다.
- Zustand automation과 AutomationSystem의 이중 write path, Direction의 queue 직접 mutation과 multi-entity queue 소비는 별도 source-of-truth epoch로 분리한다.
- `ModeState.control`을 Direction control mode로 전달하는 계약과 AnimationController의 character 고정 key는 별도 mode integration epoch로 분리한다.
- 전역 `EntityStateManager`를 entity별로 격리하는 migration은 별도 ownership epoch로 분리한다.
- mode switch 때 linear velocity, position 또는 yaw를 강제로 초기화하지 않는다.
- examples의 mode-key remount와 airplane UI를 이번 slice에서 변경하지 않는다.

## Source of Truth

- application desired mode와 automation state의 source of truth는 `useGaesupStore`다.
- `usePhysicsBridge`가 frame 시작에 읽은 하나의 store snapshot이 해당 frame의 hook-owned `PhysicsState`와 `PhysicsCalcProps.worldContext` projection source다.
- 직접 `PhysicsBridge.updateEntity()`를 호출하는 consumer에게는 전달한 `PhysicsState.modeType`이 계속 source of truth이며 bridge/system이 전역 store를 읽지 않는다.
- `PhysicsSystem`은 retained runtime transient를 소유하고 mode transition 정규화만 수행한다.

## 호환성 전략

- public `PhysicsState`, `UsePhysicsBridgeOptions`, bridge command/snapshot과 exports shape를 유지한다.
- mode 변경은 engine registration, `PhysicsState` identity와 rigid-body position/yaw/linear velocity를 보존한다.
- transition normalization은 다음 mode에서 의미 없는 direction, pitch/roll과 jump latch를 제거하고 logical heading은 보존한 채 character 진입 시 body rotation을 identity로, vehicle/airplane 진입 시 inner-group rotation을 neutral로 만들어 double yaw를 막는다.
- `automationOption`을 삭제하지 않고 최신 store object identity로 갱신한다.
- vehicle gravity 적용은 기존 `GravityComponent`의 이미 정의된 vehicle fallback과 config를 사용한다.

## 리스크

- mode 변경을 state 재생성으로 처리하면 bootstrap 위치 `+5`와 rotation lock이 다시 실행될 수 있다.
- transition 정규화를 `checkMoving` 뒤에 수행하면 stale jump/direction이 한 frame 사용될 수 있다.
- airplane→vehicle에서 gravity를 복원하지 않으면 mode projection만 고쳐도 rigid body는 이전 gravity를 유지한다.
- pitch/roll을 정리하면서 yaw 또는 velocity까지 지우면 기존 live switching 호환성이 깨질 수 있다.
- hook이 store를 frame당 여러 번 읽으면 mode와 automation/worldContext가 서로 다른 snapshot을 볼 수 있다.

## 검증

- 변경 source ESLint와 변경/신규 test `--no-ignore` ESLint.
- `usePhysicsBridge` projection/ownership focused Jest와 actual PhysicsSystem/PhysicsBridge mode transition Jest.
- motions, boilerplate hooks와 controller 관련 domain Jest.
- architecture/public/package exports focused Jest, build/root TypeScript와 `git diff --check`.
- 전체 Jest와 fresh `test:package`.
- 독립 runtime/lifecycle reviewer 감사.

## 완료 조건

- [x] mode와 automation 변경이 rerender나 re-registration 없이 다음 frame의 동일 `PhysicsState`에 반영된다.
- [x] `PhysicsState`와 `calcProp.worldContext`가 한 frame에 같은 store snapshot을 사용한다.
- [x] character·vehicle·airplane 전환이 engine/state identity, position, yaw와 velocity를 보존한다.
- [x] mode transition이 stale direction, pitch/roll과 jump transient를 다음 mode 계산 전에 정리한다.
- [x] character와 vehicle/airplane 사이 yaw ownership transfer가 logical heading을 보존하고 body+inner double yaw를 만들지 않는다.
- [x] airplane→vehicle 다음 frame에 vehicle gravity가 복원된다.
- [x] 직접 bridge caller의 명시적 `PhysicsState.modeType` contract와 public API가 유지된다.
- [x] focused/domain/type/public/package/full 검증과 독립 review를 기록한다.
- [x] `HARNESS.md`를 append하고 plan을 completed로 이동한다.

## 구현 결과

1. `usePhysicsBridge`는 실행되는 frame마다 Zustand snapshot을 정확히 한 번 읽고 initial/retained `PhysicsState.modeType`, `automationOption`과 `PhysicsCalcProps.worldContext`에 같은 객체를 사용한다.
2. live projection은 기존 bridge registration, engine, `PhysicsState`와 calc-props identity를 유지하며 mode 변경 때문에 bootstrap, 위치 보정이나 entity 재등록을 반복하지 않는다.
3. `PhysicsSystem`은 retained state의 실제 mode transition만 감지해 direction/dir, pitch/roll과 jump latch를 정리하고 logical yaw를 character inner group과 vehicle/airplane rigid body 사이에서 이전한다.
4. destination mode의 gravity, damping과 rotation-axis ownership을 공통 helper로 적용한다. focus 중 전환도 movement/impulse/force 계산 없이 같은 frame에 이 persistent body 설정을 적용한다.
5. vehicle 계산도 기존 `GravityComponent`를 통과하므로 airplane에서 전환한 즉시 vehicle gravity가 복원된다.
6. 직접 `PhysicsBridge` caller는 계속 자신이 전달한 `PhysicsState.modeType`을 source of truth로 사용하며 전역 store mode에 덮어쓰이지 않는다.

## Source of Truth와 compatibility

- application desired mode/automation의 source of truth는 Zustand이고, hook이 frame 시작에 읽은 단일 snapshot이 hook-owned frame projection의 source다.
- 직접 bridge 경로에서는 caller의 `PhysicsState.modeType`이 source of truth다. `PhysicsSystem`은 store를 import하거나 읽지 않는다.
- mode별 persistent rigid-body 설정은 `applyModeRigidBodySettings` 한 경로를 사용하고, mode transition transient와 yaw ownership은 `PhysicsSystem` instance가 소유한다.
- public 타입, hook options, bridge command/snapshot과 exports shape는 바뀌지 않았다. position, linear velocity, logical heading, engine/state identity도 유지한다.

## 검증 결과

- 변경 source와 신규/변경 test `--no-ignore` ESLint: 0 errors / 0 warnings.
- 최종 focused: 3 suites / 36 tests 통과. reviewer 재검토 focused: 2 suites / 30 tests 통과.
- motions 전체: 16 suites / 120 tests 통과. broader motions/boilerplate/controller: 23 suites / 249 tests 통과.
- architecture/public/package focused: 7 suites / 65 tests 통과.
- build/root TypeScript와 `git diff --check`: 통과.
- 전체 Jest: 195 suites / 1,772 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, declarations, ESM/CJS runtime smoke와 648-module Vite consumer bundle 통과.
- 독립 runtime/lifecycle 재검토: blocker 0 / major 0 / minor 0.

## 실패·경고·미실행과 다음 slice

- 최초 reviewer가 focus 중 mode 전환에서 destination gravity/damping/rotation 설정이 지연되는 major를 발견했다. transition 전용 persistent 설정 경로와 focused airplane→vehicle/character 회귀 테스트를 추가한 뒤 재검토했다.
- lint orchestration 한 번은 Windows PowerShell이 `&&`를 파싱하지 못해 source 실행 전에 실패했으며, `$LASTEXITCODE` 경계로 다시 실행해 통과했다.
- damping test 값이 현재 경로에서 모두 `0.4`라 값만으로 호출 시점을 구분하지 못하는 비차단 테스트 정밀도 공백이 남지만, 호출 경로와 gravity/rotation/impulse/identity assertion으로 동작을 고정했다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- renderer/examples surface가 바뀌지 않아 demo gate는 미실행했다.
- 다음 slice는 `AutomationSystem`의 wait/post/retry delay ownership, stale async continuation, idempotent start/resume와 fresh reset lifecycle을 교정한다.
