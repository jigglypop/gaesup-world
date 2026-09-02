# Epoch 2b: React Hook Order Correctness

## 목표

상태 전환에 따라 hook 호출 수와 순서가 달라지는 production 경로를 제거하고, `react-hooks/rules-of-hooks`를 기본 lint gate에 활성화해 재발을 차단한다.

## 현재 상태

`eslint-plugin-react-hooks`는 설치되어 있지만 ESLint config에 등록되지 않았다. 별도 rules-of-hooks 검사에서 5개 production 파일, 21 errors가 확인됐다.

- `RemotePlayer`: model URL guard 뒤 13개 hook.
- `PlayerInfoOverlay`: connection guard 뒤 callback hook.
- `EntityController`: URL/edit/mode guard 뒤 memo hook.
- `TileObject`: none/batched guard 뒤 5개 hook.
- `useBatchManagedEntities`: 가변 배열 map 안에서 custom hook 호출.

현재 rendering/lifecycle source of truth는 각 component/hook의 React mount와 bridge engine registry다.

## 문제

- empty→ready, disconnected→connected, object type 변경, batch 추가/삭제에서 React hook-order runtime error가 발생할 수 있다.
- `WorldConfigProvider`가 URL을 effect에서 설정해 `EntityController`의 guard 전이가 정상 startup에서도 발생한다.
- 가변 batch hook은 hook state를 배열 위치에 결합해 reorder 시 entity ownership도 바뀐다.
- 기본 lint가 이 correctness class를 검출하지 않는다.

## 범위

- network의 `RemotePlayer`, `PlayerInfoOverlay`를 outer guard와 hook-owning inner component 구조로 정리한다.
- motions `EntityController`의 hook을 모든 early return보다 앞에서 안정적으로 호출한다.
- building `TileObject`를 eligibility outer component와 rendered inner component로 분리한다.
- `useBatchManagedEntities`를 단일 hook/effect/frame lifecycle로 재작성하거나 미사용 내부 surface를 안전하게 제거한다.
- ESLint에 `react-hooks/rules-of-hooks: error`를 활성화한다.
- 각 상태 전환과 batch add/remove/reorder regression test를 추가한다.

## 제외 범위

- `react-hooks/exhaustive-deps` 52 warnings의 일괄 수정은 별도 quality slice로 남긴다.
- network protocol, physics algorithm, building rendering 결과, GLTF asset contract를 변경하지 않는다.
- bridge snapshot cache, frame scheduler, WorldDocument를 재설계하지 않는다.
- public component props와 기존 route를 변경하지 않는다.

## Source of Truth

- 현재: 조건부 return과 배열 길이가 hook lifecycle을 암묵적으로 결정한다.
- 목표: outer component가 child mount 여부를 결정하고, hook-owning component/hook은 한 mount 동안 고정된 hook graph를 가진다.
- Canonical path: React mount가 hook/resource lifecycle을 소유하며 entity ID Map이 batch bridge ownership을 소유한다.

## 호환성 전략

기존 exported component/hook signature와 화면 결과를 유지한다. URL/object eligibility 변화는 inner component mount/unmount로 표현한다. Batch API를 유지할 경우 반환 순서도 입력 순서를 유지하고 reorder만으로 engine을 재생성하지 않는다.

## 리스크

- GLTF/Rapier inner component 분리 시 ref와 animation state가 잘못 전달될 수 있다.
- batch 단일 frame loop가 기존 per-entry callback semantics를 바꿀 수 있다.
- rules-of-hooks 활성화가 테스트/생성물까지 범위를 넓히지 않도록 기존 ESLint file/ignore 계약을 유지한다.

## 검증

- lint gate: `corepack pnpm exec eslint src examples scripts --report-unused-disable-directives --max-warnings 0`에서 hook-order error 0을 확인한다. 기존 비-hook source 오류는 별도 기록한다.
- 변경 파일 ESLint와 신규 test `--no-ignore` ESLint.
- domain tests: network component, motions controller, building TileObject, boilerplate managed-entity tests.
- build 타입: `corepack pnpm exec tsc -p tsconfig.build.json --noEmit`.
- examples 타입: `corepack pnpm exec tsc --noEmit`.
- 전체 Jest: `corepack pnpm test -- --runInBand`.

## 완료 조건

- [x] 별도 rules-of-hooks 검사와 기본 ESLint가 production hook-order 위반 0건을 보고한다.
- [x] empty/ready, disconnected/connected, tile eligibility 전환이 hook error 없이 동작한다.
- [x] batch add/remove/reorder가 ID별 initialize/dispose를 정확히 한 번 수행한다.
- [x] 공개 props와 기존 화면/bridge API가 유지된다.
- [x] typecheck, 변경 lint, 관련 tests, 전체 Jest 결과를 기록한다.
- [x] 독립 invariant/frame 감사를 통과하고 `HARNESS.md`에 append한다.

## 완료 결과

### 변경

- `RemotePlayer`와 `TileObject`는 hook-owning inner component를 조건부 mount하는 outer guard 구조로 바꿨다.
- `PlayerInfoOverlay`와 `EntityController`는 모든 hook을 early return보다 앞에서 호출한다.
- `useBatchManagedEntities`는 ID Map 기반의 단일 effect와 단일 `useFrame`을 사용한다. 입력 reorder는 기존 record를 유지하고, 중복 ID는 first-wins로 하나의 lifecycle만 소유한다.
- batch 생성은 pass 단위 transactional rollback을 수행하고, cleanup은 첫 예외 이후에도 모든 record에 대해 계속된다.
- registration callback은 entity publication 다음 commit에 한 번 활성화되며 callback 교체 시 기존 cleanup과 `onUnregister`를 끝낸 뒤 새 callback을 연결한다.
- frame hot path는 indexed loop와 record별 throttle timestamp를 사용하며 collection·iterator를 생성하지 않는다.
- ESLint 기본 config에 `react-hooks/rules-of-hooks: error`를 추가했다. `react-hooks/exhaustive-deps`는 범위 밖으로 유지했다.

### Source of truth와 compatibility

- React mount가 component/resource lifecycle을 계속 소유하고, batch의 canonical ownership은 ID별 record Map이다.
- exported component/hook signature, public export, route, renderer/network/save contract는 바뀌지 않았다.
- 중복 ID의 과거 위치 기반 lifecycle은 안전한 계약이 아니었으며 이제 first-wins로 결정적이다. 저장소 내 production `useBatchManagedEntities` call site는 없다.
- callback 교체는 외부 registration ownership만 갱신하며 과거 `useBaseLifecycle`의 기계적인 bridge unregister/register event cycle은 재발행하지 않는다.

### 검증

- 변경 파일 및 신규 test ESLint(`--no-ignore --report-unused-disable-directives --max-warnings 0`): 통과.
- ESLint API production scan: `react-hooks/rules-of-hooks` 0건. 전체 configured lint에는 이번 변경과 무관한 기존 non-hook 오류 16건이 남아 있다.
- `corepack pnpm test -- src/core/boilerplate/hooks src/core/networks/components src/core/motions/controller src/core/building/components/TileObject --runInBand`: 10 suites / 131 tests 통과.
- `corepack pnpm exec tsc -p tsconfig.build.json --noEmit`: 통과.
- `corepack pnpm exec tsc --noEmit`: 통과.
- `corepack pnpm test -- --runInBand`: 188 suites 통과, 1 skipped; 1,704 tests 통과, 1 skipped.
- `git diff --check`: 통과.
- invariant 및 runtime/frame 독립 감사: 확정 blocker 없음.

### 남은 비차단 부채

- 기존 single/batch hook 모두 DI 주입 bridge와 인자 bridge의 canonical ownership이 다를 때 이중 등록·dispose 가능성이 있다.
- dependency/bridge/enabled reset은 `AbstractBridge.unregister`가 engine을 dispose한 뒤 같은 `ref.current` engine을 재등록할 수 있다. detach와 terminal dispose 계약을 후속 lifecycle slice에서 분리한다.
- 실제 R3F Canvas에서 subscription 해제를 계측하는 통합 테스트는 없고, React 19 `react-test-renderer` deprecation 경고가 남아 있다.
- 전체 ESLint의 기존 16 errors, exhaustive-deps debt, 동작하지 않는 `test:memory` script는 다음 quality-gate slice에서 다룬다.
