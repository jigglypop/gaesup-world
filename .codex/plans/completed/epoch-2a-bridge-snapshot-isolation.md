# Epoch 2a: Bridge Snapshot Isolation

## 목표

Bridge snapshot TTL cache를 bridge instance와 engine identity 단위로 격리해, 같은 frame 안의 다른 entity/runtime이 서로의 snapshot을 받지 않도록 한다.

## 현재 상태

`@CacheSnapshot`은 decorator factory closure의 단일 `Map<string, ...>`을 모든 bridge instance가 공유한다. `CoreBridge.snapshot(id)`는 `createSnapshot(engine, id)`를 호출하지만, decorator는 첫 번째 인자인 engine에 `id`가 없으면 `String(engine)`을 key로 사용한다. 따라서 여러 engine이 `"[object Object]"` key로 충돌한다.

현재 snapshot source of truth는 각 bridge engine이며 `AbstractBridge.snapshot(id)`가 engine을 조회해 `createSnapshot(engine, id)`를 호출한다.

## 문제

- 서로 다른 entity가 TTL 16ms 동안 같은 cached snapshot을 받을 수 있다.
- 서로 다른 bridge instance도 같은 decorator cache를 공유한다.
- primitive key entry는 명시적인 ownership과 정리 경로가 없다.
- `AnimationBridge`와 `UIBridge`는 public `snapshot` cache가 TTL 안의 중복 snapshot event도 억제하므로 observable compatibility 계약이다.
- 현재 테스트는 multi-entity와 multi-instance isolation을 검증하지 않는다.

## 범위

- `src/core/boilerplate/decorators/bridge.ts`의 cache ownership과 key semantics 수정.
- public `snapshot` cache와 event 억제 동작을 유지한 채 primitive key cache를 instance별로 격리.
- entity, bridge instance, engine 교체, TTL 동작 regression test 추가.

## 제외 범위

- snapshot 객체를 engine-neutral persistent model로 변경하지 않는다.
- Physics/World/Animation/Network/UI snapshot shape를 변경하지 않는다.
- frame schedule, WorldDocument, renderer, networking protocol을 변경하지 않는다.
- `AbstractBridge.snapshots`의 listener cache 계약을 재설계하지 않는다.

## Source of Truth

- 현재: bridge class decorator closure의 문자열 key cache가 snapshot 반환을 가로챈다.
- 목표: 각 bridge instance 안에서 현재 engine object identity 또는 primitive fallback key별 TTL cache를 소유한다.
- Canonical path: engine state가 canonical이며 cache는 같은 instance·같은 engine의 짧은 read optimization일 뿐이다.

## 호환성 전략

`CacheSnapshot(ttl)` signature와 bridge public API, snapshot shape, TTL 안의 public snapshot event 억제를 유지한다. `createSnapshot(engine, id)`는 첫 인자의 engine identity를 사용하고, public `snapshot(id)`는 `getEngine(id)`의 현재 engine identity를 해석한다. 존재하지 않는 bridge ID는 cache하지 않는다. 일반 primitive-key method는 instance별 fallback cache와 amortized expiry pruning을 사용한다.

## 리스크

- decorator application별 cache ownership을 유지해 동일 decorator instance를 여러 method에 재사용해도 결과가 섞이지 않아야 한다.
- fake timer와 `Date.now()`의 TTL 경계: 16ms 미만 hit, 16ms 이상 miss를 명시적으로 테스트한다.
- object identity cache는 engine 교체 시 새 snapshot을 계산해야 한다.

## 검증

- 테스트: `corepack pnpm test -- src/core/boilerplate src/core/animation/bridge src/core/networks/bridge --runInBand`
- 타입: `corepack pnpm exec tsc -p tsconfig.build.json --noEmit`
- lint: 변경 파일 대상 ESLint.
- 전체 회귀: `corepack pnpm test -- --runInBand`
- 성능: 동일 engine의 TTL 내 연속 호출이 한 번만 계산되는지 단위 테스트로 확인.
- examples: public API와 examples 동작을 변경하지 않으므로 별도 route 변경 없음.

## 완료 조건

- [x] 다른 entity와 다른 bridge instance가 cache를 공유하지 않는다.
- [x] 같은 ID로 engine을 교체해도 이전 snapshot이 반환되지 않는다.
- [x] TTL 안의 동일 engine 호출은 재계산하지 않고 TTL 이후 재계산한다.
- [x] 변경 파일 lint, build TypeScript, 관련 테스트, 전체 Jest 결과를 기록한다.
- [x] `HARNESS.md`에 라운드 결과를 append한다.

## 완료 결과

- `CacheSnapshot` cache ownership을 decorated method별, bridge instance별로 분리했다.
- object argument와 public string ID는 현재 engine object identity를 key로 사용한다.
- 존재하지 않는 bridge ID는 cache하지 않아 miss 후 register가 즉시 새 snapshot을 만든다.
- generic primitive cache는 amortized expiry pruning을 사용하며 빈 Map hot path에서는 iterator를 만들지 않는다.
- Animation/UI public snapshot TTL cache와 snapshot event 억제 호환성을 유지했다.

## 검증 결과

- decorator regression: 8 tests 통과.
- 관련 bridge/boilerplate: 21 suites, 399 tests 통과.
- build TypeScript: 통과.
- 변경 source ESLint: 통과.
- 신규 test ESLint(`--no-ignore`): 통과.
- 전체 Jest: 183 suites 통과, 1 skipped; 1,691 tests 통과, 1 skipped.
- `git diff --check`: 통과. 기존 worktree의 line-ending 경고만 출력.
- 독립 invariant/performance 감사: 확정 blocker 없음.
- `pnpm test:memory`: 기존 script가 제거된 Jest `--testPathPattern` 옵션을 사용해 실행 전 실패. 현재 옵션으로 재실행하면 memory 이름의 suite가 없어 `No tests found`; 이번 slice의 cache lifecycle은 focused tests와 독립 performance 감사로 검증했다.

## 남은 후속 항목

- command 직후 동일 engine의 TTL snapshot이 허용된 coalescing인지 revision invalidation 대상인지 별도 listener-cache slice에서 결정한다.
- invalid TTL(`NaN`) validation과 깨진 `test:memory` script는 quality-gate slice에서 처리한다.
