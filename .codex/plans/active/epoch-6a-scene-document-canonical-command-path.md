# Epoch 6a: SceneDocument Canonical Command Path

## 목표

이미 직렬화·검증·migration 경계가 존재하는 `SceneDocument`를 장기 `WorldDocument`의 첫 수직 subset으로 채택하고, editor·save·runtime projection이 공유하는 engine-neutral canonical command/controller 경계를 도입한다. 새 광역 `WorldDocument` 타입이나 subpath를 만들지 않고 기존 public scene-object surface를 strangler migration한다.

## 현재 상태

- `src/core/scene-object`는 document schema, parser, serializer, migration과 runtime loader를 제공하지만 document mutation의 canonical write path는 없다.
- `createSceneObjectEditorCommands`는 closure 안에서 document를 clone/spread하고 store에 직접 기록한다. delete는 direct child만 제거해 더 깊은 descendant를 orphan으로 남길 수 있다.
- `WorldEditorSurface`는 controlled `SceneDocument`를 Editor에 전달하지 않으므로 `/creator` editor와 `/world` runtime이 같은 persistent snapshot을 projection하지 않는다.
- `SaveSystem`은 binding과 diagnostics를 제공하지만 scene document binding은 등록되지 않았다.
- 기존 Three-bound `WorldCommand`와 `next.EntityId`는 이번 persistent document command/ID 경계와 의미가 다르다.

## 범위

- engine-neutral `SceneDocumentCommand`, deterministic event, accepted/rejected result와 pure command application을 `src/core/scene-object`에 추가한다.
- create/add payload에는 dispatch 전에 materialized stable ID와 canonical JSON data를 포함한다.
- create, update, recursive delete, move, component add/remove와 whole-document replace를 지원한다.
- missing target, duplicate ID, invalid parent, hierarchy cycle, invalid canonical JSON/schema를 rejection으로 반환하고 원본 document identity와 state를 보존한다.
- React-free controller가 owned immutable snapshot, dispatch, ordered subscription을 소유한다. accepted state를 먼저 publish하고 listener failure를 격리하며 rejected command는 state/event/notification을 바꾸지 않는다.
- `SaveSystem` binding은 기본 key `scene-document`로 serialize/hydrate한다. nullish hydrate와 invalid/migration-failed hydrate는 현재 document를 보존하고 invalid input은 diagnostics가 관찰할 수 있도록 실패시킨다.
- `createSceneObjectEditorCommands`를 canonical command path 위로 옮기되 기존 public command factory shape, label, ID generation, undo/redo semantics와 legacy store compatibility를 보존한다.
- `/creator`와 `/world` 예제가 하나의 scene-document controller snapshot을 구독한다. editor mutation과 save/load round-trip을 같은 controller에 연결하고 runtime은 정확성이 보장되는 root-object marker만 projection한다.
- `createGaesupRuntime()` 생성은 전역 SaveSystem listener/binding을 활성화하지 않게 하고, 외부 save ownership은 직렬화된 `setup()`/`dispose()` generation에 둔다. setup 실패와 dispose throw에서도 diagnostics listener, option/plugin binding과 service cleanup을 끝까지 시도한다.
- `WorldSystems`는 StrictMode effect replay와 route 전환에서 world load → dispose → next load 순서를 하나의 generation queue로 직렬화하고, rejected load와 logger failure를 unhandled promise로 남기지 않는다.
- 같은 SaveSystem의 automatic world hydrate는 process session에서 한 번만 수행하고 concurrent route generation은 같은 in-flight load를 공유한다. 실패한 load는 retry 가능하며 명시적 manual load API는 유지한다.
- example session의 Promise 기반 CRUD wrapper는 command factory의 동기 materialization 오류와 command execution rejection을 모두 같은 handled `false` 결과로 정규화한다.
- public barrel/root exports와 package declarations/runtime consumer probe를 추가해 fresh ESM/CJS package에서 실제 접근 가능함을 검증한다.

## 제외 범위

- 새 `WorldDocument` 광역 schema/subpath, building store 통합, prefab authoring command와 network replication은 추가하지 않는다.
- Three/Rapier 객체를 persistent document나 command/event payload에 넣지 않는다.
- 기존 Three-bound `WorldCommand`, numeric `next.EntityId`, `NextWorld`, prefab/building compatibility path를 이름 변경하거나 통합하지 않는다.
- parent rotation/scale을 포함한 hierarchy transform math는 다루지 않는다. example runtime projection은 root object로 제한한다.
- asset catalog ownership, SaveSystem 전체 fail-open policy, visit/social trust policy는 후속 slice로 남긴다.

## Source of Truth

- persistent scene schema·validation·migration은 계속 `src/core/scene-object`가 canonical source다.
- 모든 새 persistent scene mutation은 `applySceneDocumentCommand`가 canonical calculation path이며 controller와 editor adapter는 이를 우회하지 않는다.
- controller의 immutable owned snapshot이 process-local current scene document다. React, Zustand, Three.js와 Rapier 객체는 canonical state가 아니다.
- save/load는 scene migration/parser를 거쳐 controller의 replace command로 진입한다. invalid hydrate는 current snapshot을 변경하지 않는다.
- editor와 runtime example은 같은 controller snapshot의 서로 다른 projection이다.

## 호환성 계약

- 기존 scene-object public symbols, document version/schema, editor command factory API, route와 save navigation key `scene`을 유지한다.
- 새 persistence key는 `scene-document`를 사용해 기존 navigation `scene` payload와 충돌하지 않는다.
- accepted result document/event와 controller snapshot은 caller-owned mutation으로 내부 state를 바꿀 수 없게 한다.
- rejected command는 throw 없이 명시적 rejection result를 주며 editor/SaveSystem adapter만 기존 계약에 맞게 rejection을 오류로 승격할 수 있다.
- listener 재진입에서도 accepted command/event 순서를 보존하고 한 listener의 throw가 다른 listener와 dispatch를 막지 않는다.
- examples는 `gaesup-world` 또는 적절한 public subpath만 import한다.

## 리스크

- mutable reference가 controller 밖으로 누출되면 command를 우회한 state mutation이 가능하다.
- move/update가 cycle 또는 missing parent를 허용하면 persisted hierarchy가 손상될 수 있다.
- delete가 전체 descendant closure를 계산하지 않으면 orphan object가 남는다.
- editor undo payload가 mutation 뒤 snapshot을 참조하거나 ID를 재생성하면 deterministic redo와 selection 호환성이 깨진다.
- `useSyncExternalStore` snapshot identity가 매 read마다 바뀌면 render loop가 생길 수 있다.
- reentrant listener notification을 즉시 중첩 순회하면 observer별 event 순서가 달라질 수 있다.
- runtime 생성 시 SaveSystem diagnostics를 구독하면 StrictMode가 버린 render generation이 disposer 없이 전역 listener를 남긴다.
- effect cleanup이 pending world load와 직렬화되지 않으면 setup/dispose/setup이 겹쳐 plugin save binding이 중복 등록되거나 disposed runtime이 뒤늦게 ready가 될 수 있다.
- `/creator`에서 autosave 전 편집한 뒤 `/world`가 같은 persisted blob을 자동 재hydrate하면 shared in-memory scene snapshot이 과거 상태로 되돌아갈 수 있다.
- Promise CRUD wrapper의 command factory가 `try` 바깥에서 실행되면 malformed authoring input이 boolean rejection 대신 동기 throw로 새어 나간다.
- package barrel만 테스트하고 fresh tarball runtime을 확인하지 않으면 declarations/CJS export 누락을 놓칠 수 있다.

## 검증

- pure command tests: accepted/rejected identity, stable ID, canonical JSON, recursive delete, cycle/missing/duplicate rejection, deterministic event와 input ownership.
- controller tests: immutable stable snapshot, rejected no-op, exact event ordering, reentrant dispatch, unsubscribe/stale disposer, listener throw isolation.
- save binding tests: round-trip, migration, nullish/invalid preservation, diagnostics와 key isolation.
- editor command stack tests: create/update/move/delete/add/remove, recursive undo/redo, stable IDs, legacy store/controller parity와 rejected command stack behavior.
- examples tests: controlled Editor wiring, shared snapshot projection, root-only marker, save/load round-trip와 public-only imports.
- runtime lifecycle tests: create-time SaveSystem 비활성, serialized setup/dispose/setup, setup failure rollback, dispose failure cleanup, StrictMode world load/dispose ordering, SaveSystem별 initial hydrate dedup/retry와 handled rejection.
- `corepack pnpm test -- src/core/scene-object src/core/editor --runInBand`
- `corepack pnpm exec eslint <changed-files>`와 test/example 파일 `--no-ignore`, Prettier, `git diff --check`
- `corepack pnpm exec tsc -p tsconfig.build.json --noEmit`, `corepack pnpm exec tsc --noEmit`
- `corepack pnpm test -- src/__tests__/publicApi.test.ts src/__tests__/packageExports.test.ts src/__tests__/examplePackageConsumption.test.ts --runInBand`
- `corepack pnpm test:demo`, 전체 Jest, memory gate, fresh package ESM/CJS/declaration/runtime/Vite consumer를 실행한다.
- implementation agent와 독립 reviewer가 architecture boundary, resource/state ownership, public API와 examples integration을 검토한다.

## 완료 조건

- [ ] persistent scene mutation이 pure command application 한 경로를 사용하고 invalid command는 identity-preserving rejection이다.
- [ ] controller가 stable immutable owned snapshot과 ordered, failure-isolated subscription을 제공한다.
- [ ] save hydrate가 migration/parser/canonical replace를 거치며 invalid input에서 기존 state를 보존한다.
- [ ] editor의 기존 public command/undo/redo 계약이 canonical path 위에서 유지되고 recursive delete orphan 결함이 사라진다.
- [ ] `/creator` editor와 `/world` root runtime marker가 같은 scene controller snapshot을 projection하고 save/load round-trip이 검증된다.
- [ ] discarded render generation은 전역 SaveSystem을 구독하지 않고 runtime/world effect generation은 setup·load·dispose를 순서대로 소유한다.
- [ ] malformed example authoring input과 runtime load failure가 동기 throw 또는 unhandled rejection으로 누출되지 않는다.
- [ ] public exports와 fresh ESM/CJS package consumer가 새 API를 실제 type/runtime에서 확인한다.
- [ ] focused, lint/format, build/root type, public, demo, full, memory, package 검증과 독립 reviewer 결과를 기록한다.
- [ ] `HARNESS.md`를 append하고 이 plan을 `completed/`로 이동한다.
