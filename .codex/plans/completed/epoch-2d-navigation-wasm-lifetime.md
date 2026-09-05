# Epoch 2d: Navigation WASM Lifetime

## 목표

`NavigationSystem` singleton의 비동기 초기화와 WASM 메모리 소유권을 직렬화해 동시 `init()` 누수, 중복 해제, `dispose()` 뒤 초기화 부활을 차단한다.

## 현재 상태

- world scene, `useClicker`, `NPCSystem`이 같은 singleton에서 `init()`을 독립적으로 호출한다.
- `ready`만 검사하므로 두 호출이 같은 `loadCoreWasm()`을 기다린 뒤 각각 grid/path buffer를 할당하고 마지막 포인터만 남길 수 있다.
- `dispose()`는 포인터와 WASM 참조를 초기화하지 않아 같은 인스턴스의 반복 해제가 동일 포인터를 다시 deallocate한다.
- 비동기 `init()` 대기 중 `dispose()`해도 continuation이 자원을 할당하고 `ready = true`로 되살릴 수 있다.

## 범위

- in-flight initialization을 한 Promise로 공유한다.
- lifecycle generation으로 stale initialization continuation을 무효화한다.
- WASM buffer release를 한 경로에 모으고 포인터/참조를 즉시 초기화해 멱등성을 보장한다.
- 동시 init, 반복 dispose, init/dispose 경쟁을 deterministic Jest test로 고정한다.

## 제외 범위

- navigation 알고리즘, grid representation, WASM ABI와 public API는 변경하지 않는다.
- singleton 자체를 dependency injection으로 교체하지 않는다.
- motion/physics ownership, automation timer, bridge exception cleanup은 후속 epoch로 분리한다.

## Source of Truth

- 각 `NavigationSystem` generation은 최대 한 번의 initialization task와 최대 한 쌍의 WASM buffer를 소유한다.
- `dispose()`가 반환된 generation은 이후 어떤 비동기 continuation도 ready 상태나 WASM 자원을 복구할 수 없다.
- 해제된 pointer는 즉시 0이 되며 각 allocation은 최대 한 번만 deallocate된다.

## 호환성 전략

`getInstance()`, `init(): Promise<boolean>`, navigation query/mutation API와 successful initialization의 반환값을 유지한다. 이미 ready인 인스턴스는 계속 즉시 성공하고, dispose 뒤 `getInstance()`는 새 singleton generation을 만든다.

## 리스크

- stale initialization을 무효화할 때 새 singleton이 공유 loader 결과를 사용하는 정상 경로까지 막을 수 있다.
- Promise 정리 순서를 잘못 잡으면 실패한 initialization 이후 retry가 불가능해질 수 있다.
- partial allocation 중 예외가 발생하면 먼저 할당된 buffer가 누수될 수 있다.

## 검증

- `corepack pnpm exec eslint src/core/navigation/NavigationSystem.ts`와 `corepack pnpm exec eslint --no-ignore src/core/navigation/__tests__/NavigationSystem.test.ts`.
- `corepack pnpm test -- src/core/navigation/__tests__/NavigationSystem.test.ts src/core/navigation/__tests__/NPCNavigationAdapter.test.ts --runInBand`.
- `corepack pnpm exec tsc -p tsconfig.build.json --noEmit`.
- `corepack pnpm exec tsc --noEmit`.
- `git diff --check`.

## 완료 조건

- [x] 동시 `init()` 호출이 allocation 쌍 하나만 만든다.
- [x] 반복 `dispose()`가 각 pointer를 최대 한 번만 해제한다.
- [x] init 대기 중 dispose 후 loader가 resolve되어도 allocation과 ready 부활이 없다.
- [x] initialization 실패/partial allocation의 ownership이 정리되고 retry 계약이 테스트된다.
- [x] 좁은 lint/test와 build/root typecheck 결과를 기록한다.
- [x] 독립 검토를 통과하고 `HARNESS.md`에 append한다.

## 구현 결과

- `initialization` Promise를 instance별로 공유해 동시에 호출된 `init()`이 loader와 allocation을 한 번만 수행한다.
- lifecycle generation을 캡처하고 loader resolve 및 allocation 단계마다 확인해 stale continuation을 commit하지 않는다. dispose로 취소된 init은 `false`를 반환한다.
- grid/path pointer는 로컬 pending ownership에서 준비하고 grid sync까지 성공한 뒤에만 instance에 commit한다. loader 또는 partial allocation 실패 시 소유한 pointer만 회수하고 Promise slot을 비워 retry를 허용한다.
- release는 instance pointer와 WASM 참조를 먼저 0/null로 만든 뒤 deallocate하고, 오래된 instance의 반복 dispose가 replacement singleton을 분리하지 않도록 identity를 확인한다.
- 동시 init, 반복 dispose, stale init, replacement singleton, shared pending loader, loader failure retry와 partial allocation retry를 7개 regression test로 고정했다.

## 최종 검증 결과

- source ESLint와 test `--no-ignore` ESLint: 0 errors / 0 warnings.
- `corepack pnpm test -- src/core/navigation src/core/building/__tests__/navigation.test.ts --runInBand`: 3 suites / 35 tests 통과.
- `corepack pnpm exec tsc -p tsconfig.build.json --noEmit`: 통과.
- `corepack pnpm exec tsc --noEmit`: 통과.
- `git diff --check`: 통과. 기존 worktree 파일의 LF→CRLF 안내만 출력됐다.
- 독립 lifecycle 검토: blocker, major, minor 없음.

## 실패·미실행과 잔여 debt

- 최초 ESLint 명령은 repository ignore 때문에 test 파일을 건너뛰고 warning 1건을 냈다. 계획과 실행을 `--no-ignore`로 교정해 0 warnings로 재검증했다.
- 추가 replacement-loader test가 persistent Jest mock implementation을 다음 test에 누출해 navigation suite가 일시 실패했다. 두 번의 one-shot mock으로 격리한 뒤 3 suites / 35 tests를 재검증했다.
- full-file Prettier check는 이 두 legacy 파일의 기존 formatting debt 때문에 실패했다. unrelated 전체 재format은 되돌리고 변경 코드는 ESLint와 typecheck로 검증했다.
- public API, package export와 examples surface가 변하지 않아 전체 Jest, `test:package`, `test:demo`는 이 slice에서 재실행하지 않았다. Epoch 2c의 직전 전체 gate 결과를 대체하지 않는다.
- 실제 WASM deallocator trap 주입은 미실행했다. 다음 resource slice는 공유 PhysicsBridge의 entity별 engine ownership을 다룬다.
