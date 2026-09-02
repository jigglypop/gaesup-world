# Epoch 2i: Automation Execution Lifetime

## 목표

`AutomationSystem`의 wait, post-action과 retry delay를 system-owned cancellable resource로 만들고 하나의 monotonic execution generation만 state, stats, events와 다음 실행을 변경할 수 있게 해 pause·stop·reset·dispose 및 중복 start/resume 뒤 stale async continuation과 timer 부활을 차단한다.

## 현재 상태

- wait action은 소유되지 않은 `setTimeout` Promise를 await하므로 pause, stop, reset과 dispose가 timer나 Promise를 취소·settle하지 못한다.
- `executeNext`는 async 경계 뒤 lifecycle/generation을 재검증하지 않아 취소된 action이 stats/index/event를 갱신하고 다음 timer를 다시 예약할 수 있다.
- `start()`는 running guard가 없어 같은 current action에 여러 실행 chain을 만들며, resume와 timer callback은 rejected Promise를 관찰하지 않는다.
- post-action/retry만 `executionTimer`에 저장하고 wait는 별도 timer를 쓰며 `window.setTimeout`과 ambient timer가 혼재해 Node/SSR와 handle type 경계가 불안정하다.
- object initializer를 사용하는 현재 reset은 nested queue/settings/stats와 metrics를 current state seed로 재사용하고 config도 초기화하지 않는다.
- event observer 예외가 cleanup을 중단하면 dispose가 listener를 정리하지 못하고 `isDisposed` commit에도 도달하지 못할 수 있다.

## 범위

- lifetime 동안 단조 증가하는 execution generation과 단 하나의 owned delay handle/cancellation settler를 둔다.
- 모든 wait/post/retry delay를 cancellation 시 반드시 settle되는 공통 delay primitive와 ambient timer API로 통합한다.
- async 경계와 callback/event 경계 뒤 generation, running, paused, disposed를 검증해 stale state/stat/event/schedule mutation을 차단한다.
- `start`, `pause`, `resume`, `stop`을 idempotent하게 만들고 동시에 하나의 execution chain만 허용한다.
- factory initializer로 fresh nested state/metrics를 생성하고 reset에서 config도 fresh default로 복원한다.
- `getConfig()`가 nested visual-cue 객체를 외부와 공유하지 않게 한다.
- observer 예외를 listener별로 project logger에 격리해 cleanup과 다른 listener 실행을 보장하고 fire-and-forget 진입점이 unhandled rejection을 만들지 않게 한다.
- wait/post/retry cancellation, duplicate lifecycle calls, stop→restart race, fresh reset/config ownership과 observer 예외를 deterministic fake-timer tests로 고정한다.

## 제외 범위

- `SystemRegistry` overwrite/dispose/unregister ownership과 injected `AutomationSystem`의 `InteractionBridge` dispose ownership은 별도 registry/bridge epoch로 분리한다.
- Zustand automation slice와 `AutomationSystem`의 이중 write path, Direction의 queue 직접 mutation과 multi-entity queue 소비는 별도 source-of-truth epoch로 분리한다.
- 실행 중 `removeAction`/`clearQueue`의 current-index 의미, queue immutable API와 retry metadata의 canonical 위치는 queue semantics epoch로 분리한다.
- `AutomationSystem`의 bridge-types upward edge와 중복 core/bridge automation type schema 이동은 별도 domain-boundary epoch로 분리한다.
- timeoutDuration, maxConcurrentActions, progress/visual cue 기능 구현과 public API 확대는 이번 slice에 포함하지 않는다.
- pause 시 남은 wait 시간을 보존하지 않고 resume에서 현재 action delay를 처음부터 재실행한다.

## Source of Truth

- system-local queue/state는 `AutomationSystem` 실행 상태의 source of truth다.
- monotonic execution generation이 어떤 async continuation이 현재 실행을 변경할 권한이 있는지 결정하는 canonical runtime token이다.
- system-owned delay handle과 cancellation settler만 wait/post/retry scheduling resource를 소유하며 lifecycle invalidation이 유일한 취소 경로다.
- constructor/reset factory가 state, metrics와 config 기본값의 source of truth다.

## 호환성 전략

- public `AutomationSystem` method signature, exported type와 event 이름/payload를 유지한다.
- action event 순서, `duration || 1000`, `action.delay || throttle`, retry count/maxRetries와 completion 시 `automationStopped` 후 `automationCompleted` 순서를 유지한다.
- `start()`는 현재 action 실행과 다음 delay 예약까지 await하는 기존 의미를 유지하되 running 중 중복 start는 no-op이다.
- pause는 current index/action을 보존하고 owned delay를 취소하며, resume은 현재 action을 한 번만 다시 실행한다.
- stop은 queue와 current index를 보존하고 `currentAction`만 비우며 재시작은 현재 index부터 진행한다.
- reset은 event listener를 유지하면서 fresh state/metrics/config를 만들고 기존 `automationStopped`, `queueCleared` event를 같은 순서로 발생시킨다.
- dispose는 pending Promise를 settle하고 stopped event를 보낸 뒤 listener를 정리하며 반복 호출은 기존 base lifecycle처럼 no-op이다.

## 리스크

- 취소 시 Promise를 settle하지 않으면 caller가 영원히 pending되고 Jest open handle 및 실제 lifecycle leak가 남는다.
- generation을 reset 때 0으로 되돌리면 이전 continuation token과 새 실행 token이 충돌할 수 있다.
- stale continuation이 owned handle을 무조건 null/clear하면 stop 직후 시작한 새 generation timer를 취소할 수 있다.
- pause/resume가 current action을 중복 실행하거나 retry count를 두 번 증가시키면 event/stat 호환성이 깨질 수 있다.
- observer 예외 격리를 전역 decorator 변경으로 구현하면 다른 system의 오류 정책까지 바뀌므로 이번 slice에서는 local event dispatch에 한정한다.
- reset event를 base reset 이전에 보내거나 listener를 지우면 기존 observer가 다른 state identity/order를 볼 수 있다.

## 검증

- 변경 source ESLint와 변경/신규 test `--no-ignore` ESLint.
- `AutomationSystem` deterministic Jest: wait pause/stop/reset/dispose, post/retry cancellation, duplicate start/pause/resume, stop→restart race, loop/completion/event order, callback error와 observer isolation.
- `InteractionBridge`, interactions domain, architecture/public/package exports focused Jest.
- build/root TypeScript와 `git diff --check`.
- 전체 Jest와 fresh `test:package`.
- 독립 lifecycle/resource/public compatibility reviewer 감사.

## 완료 조건

- [x] wait/post/retry timer와 pending Promise가 system ownership 아래 있고 pause·stop·reset·dispose에서 timer 0개로 settle된다.
- [x] invalidated generation은 stats, index, callbacks, action/completion events와 다음 timer를 변경하지 않는다.
- [x] duplicate start/pause/resume가 event나 execution chain을 중복 생성하지 않는다.
- [x] stop→restart race에서 이전 continuation이 새 generation의 state/timer를 건드리지 않는다.
- [x] reset이 fresh nested state/metrics/config를 만들고 이전 generation late mutation을 차단한다.
- [x] observer 예외가 다른 listener, lifecycle cleanup과 disposed commit을 막지 않으며 unhandled rejection이 없다.
- [x] 기존 delay/retry/loop/event order와 stop queue/index compatibility가 유지된다.
- [x] focused/domain/type/public/package/full 검증과 독립 review를 기록한다.
- [x] `HARNESS.md`를 append하고 plan을 completed로 이동한다.

## 구현 결과

1. wait, post-action과 retry delay를 ambient `setTimeout` 기반의 단일 owned handle/cancellation settler로 통합하고 취소 시 Promise를 반드시 `false`로 settle한다.
2. lifetime-monotonic execution generation이 async continuation의 state/stat/event/schedule 권한을 판정하며, old delay cleanup은 handle/settler identity가 일치할 때만 ownership field를 비운다.
3. `start`, `pause`, `resume`, `stop`을 idempotent하게 만들고 running 중 duplicate start와 paused start를 차단한다. 첫 action/request는 기존처럼 `start()` 호출 stack에서 동기 진입한다.
4. start/resume마다 증가하는 별도 run identity와 active stopped-dispatch set으로 같은 run의 reset/dispose 중첩 stopped만 억제하면서 reentrant 새 run의 `started → stopped → completed`를 보존한다.
5. factory initializer와 reset 후 silent normalization으로 top-level reset identity를 유지하면서 listener가 오염한 nested state/metrics/config도 기본값으로 복원한다. reset 중 explicit/auto-start는 실행되지 않는다.
6. event observer 예외는 listener별로 project logger에 격리하고 detached async entry의 rejection을 소비해 다른 listener, cleanup과 disposed commit을 보장한다.
7. stop은 queue/current index를 보존하며 current action만 비우고, pause한 wait는 resume 시 전체 duration으로 현재 action을 다시 실행한다.

## Source of Truth와 compatibility

- `AutomationSystem`의 queue/state가 system-local execution state source of truth이고 execution generation이 현재 async mutation 권한의 canonical token이다.
- run identity는 stopped event lifecycle ownership만 구분하며 generation cancellation 권한과 분리된다.
- system-owned delay handle과 settler가 모든 wait/post/retry resource의 유일한 owner이고 lifecycle invalidation이 canonical cancellation path다.
- constructor/reset factory가 state, metrics와 config defaults의 source of truth다.
- public method signature, exported type와 event 이름/payload를 유지했다. `duration || 1000`, `action.delay || throttle`, retry/maxRetries, loop와 자연 완료의 stopped-before-completed 순서도 유지한다.
- 의도적으로 idle/duplicate pause·resume·stop은 event를 만들지 않고 observer throw는 action retry가 아닌 observer-local error로 격리한다. `afterCallback` 실패는 success stats/index를 갱신하지 않고 retry한다.

## 검증 결과

- 변경 source와 test `--no-ignore` ESLint: 0 errors / 0 warnings.
- root focused architecture/Automation/InteractionBridge/public/package: 6 suites / 102 tests 통과.
- interactions 전체: 8 suites / 110 tests, lifetime 전용 24 tests 통과.
- build/root TypeScript와 `git diff --check`: 통과.
- 전체 Jest: 196 suites / 1,796 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, declarations, ESM/CJS runtime smoke와 648-module Vite consumer bundle 통과.
- 독립 lifecycle/resource/public compatibility 최종 재검토: blocker 0 / major 0 / minor 0.

## 실패·경고·미실행과 다음 slice

- 최초 root 통합에서 기존 bridge-types 일반 import를 type-only로 바꾼 탓에 exact architecture edge kind가 달라졌고 1 test가 실패했다. 이번 boundary 제외 범위에 맞게 기존 import kind를 복원해 재검증했다.
- 독립 리뷰가 reset observer의 auto-start, stopped observer reset/dispose 중복 발행, stack-global boolean이 reentrant 새 run의 stopped를 억제하는 세 major를 순차 재현했다. reset guard/default normalization과 run-aware stopped ownership으로 각각 수정하고 재검토했다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- renderer/examples surface가 바뀌지 않아 demo gate는 미실행했다.
- 다음 slice는 `AutomationSystem`이 의존하는 중복 core/bridge automation type schema와 Layer 1 upward edge를 canonical core types로 정리한다.
