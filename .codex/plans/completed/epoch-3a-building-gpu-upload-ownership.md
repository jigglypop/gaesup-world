# Epoch 3a: Building GPU Upload Ownership

## 목표

building spatial/meta/indirect GPU upload resource의 최신 record와 최종 dispose 책임을 render store의 단일 canonical 경로로 통합해, 두 upload driver의 stale private ref가 indirect buffer를 유실·누수시키는 lifecycle 결함을 교정한다.

## 현재 상태

- `BuildingGpuUploadDriver`와 `BuildingIndirectArgsUploadDriver`가 같은 resource bundle을 각각 private ref로 추적한다.
- spatial driver가 resource `A`를 만들고 indirect driver가 indirect buffer를 합성한 `B`를 store에 기록해도 spatial driver의 ref는 계속 `A`다.
- 다음 spatial sync는 stale `A`를 기반으로 store를 덮어써 `B`의 indirect buffer를 도달 불가능하게 만들며 어느 cleanup도 이를 destroy하지 못한다.
- render store의 `reset()`은 현재 upload resource reference를 empty record로 교체할 뿐 GPU buffer를 destroy하지 않는다.
- typed-array mirror, dirty range와 queue upload 계산은 이미 pure helper로 분리되어 있고 이번 결함의 원인이 아니다.

## 범위

- render store의 `setUploadResources`가 direct value와 functional updater를 모두 받아 항상 최신 record에 변경을 직렬 합성하게 한다.
- store는 현재 upload resource record의 terminal dispose 책임을 인수하고, sync helper는 resize/zero-size 전환에서 교체한 개별 buffer의 기존 retirement 책임을 유지한다.
- store에 현재 resource를 먼저 fresh empty record로 분리한 뒤 기존 buffers를 destroy하는 idempotent release action을 추가한다.
- Zustand의 동기 subscriber fanout이 throw해도 detached buffers는 `finally` 경계에서 destroy하고 원래 observer 예외는 그대로 전파한다.
- 전체 `reset()`도 같은 detach-before-destroy 의미로 snapshot/counters와 upload resource를 원자적으로 초기화한다.
- spatial upload driver의 private resource ref를 제거하고 store functional updater로 spatial/meta resource를 합성한다.
- spatial driver cleanup은 store의 canonical release action만 호출한다.
- indirect upload driver의 private ref와 render마다 실행되는 store 동기화 effect를 제거하고 같은 functional updater로 indirect resource를 합성한다.
- spatial → indirect → 같은 크기 spatial update에서 indirect identity가 유지되고 unmount/reset에서 현재 record의 distinct/non-throwing buffers가 정확히 한 번 destroy되는 회귀 테스트를 추가한다.

## 제외 범위

- renderer 또는 GPU device 교체 시 동일 크기 buffer 재사용 정책은 변경하지 않는다.
- GPU culling readback의 비동기 unmount race와 allocation은 변경하지 않는다.
- grass texture, material, geometry와 다른 렌더링 resource ownership은 변경하지 않는다.
- WebGPU renderer 선택, `init()` fallback, WebGL compatibility boundary와 public renderer API는 변경하지 않는다.
- building snapshot, typed-array mirror, dirty range, visibility, culling, LOD와 queue upload 알고리즘은 변경하지 않는다.
- public export symbol과 package subpath는 추가하거나 변경하지 않는다. 이미 공개된 store의 inferred action surface에는 additive release action과 setter parameter widening이 반영된다.

## Source of Truth

- 현재는 render store 값과 두 driver private ref가 동일 GPU bundle의 경쟁 source다.
- 목표 canonical source는 transient `useBuildingRenderStateStore.uploadResources` 최신 record 하나다.
- store functional updater가 resource bundle의 canonical write path다.
- store가 current record의 terminal destroy 책임을 가지며 driver ref는 소유권을 갖지 않는다. resize/zero-size에서 displaced 된 개별 buffer는 기존 sync helper가 retire한다.
- typed-array building mirror와 render snapshot의 기존 data authority는 바꾸지 않는다.

## 호환성 계약

- 기존 direct `setUploadResources(resource)` 호출은 계속 동작한다.
- public direct setter는 exact assignment와 새 current record의 ownership transfer만 보존하는 compatibility escape hatch다. direct A→B가 임의 buffer를 displace할 때의 retirement는 caller 책임이며, 내부 resource 전이는 functional updater와 sync helper만 사용하고 final current record는 release/reset이 정리한다.
- 기존 component names, props, exports와 `BuildingController` 구성은 유지한다.
- `useBuildingRenderStateStore`의 기존 state/actions와 direct setter 호출은 유지하며 새 release action은 additive다.
- 같은 device와 capacity에서 spatial/meta/indirect buffer reuse, dirty range와 queue write 동작을 유지한다.
- indirect driver가 추가한 buffer는 후속 spatial update가 명시적으로 제거하지 않으며 identity를 유지한다.
- release/reset은 current store record를 먼저 empty로 publish하고 distinct/non-throwing current buffers를 각각 한 번 destroy한다.
- 반복 release, driver cleanup과 store reset 순서가 달라도 이미 분리된 buffer를 다시 destroy하지 않는다.
- INV-018의 typed-array/GPU upload 구조와 hot-path scratch reuse를 보존한다.

## 리스크

- direct value setter만 유지하면 두 effect의 read-modify-write가 다시 stale snapshot을 덮어쓸 수 있다.
- destroy 전에 store observer가 재진입하면 아직 소유 중인 record를 다시 release할 수 있으므로 detach가 먼저여야 한다.
- detach publish의 동기 subscriber가 throw하면 `finally`가 없는 cleanup은 old record를 영구 유실한다.
- sync helper는 functional updater 안에서 GPU destroy/create/write side effect를 수행하므로 updater는 non-reentrant GPU device/store callback이라는 기존 precondition을 유지한다.
- module-global empty record를 재사용하면 reset 사이 identity나 오염이 공유될 수 있다.
- driver cleanup마다 private record를 destroy하면 서로의 최신 buffer를 누락하거나 중복 destroy할 수 있다.
- React StrictMode cleanup/remount 순서가 release idempotency를 드러낼 수 있다.
- store reset에서 state 초기화와 resource release를 별도 write로 나누면 observer가 중간 상태를 볼 수 있다.

## 검증

- store focused test에서 direct setter compatibility, 최신 record 기반 functional composition, detach-before-destroy와 반복 reset/release idempotency를 검증한다.
- throwing subscriber가 detach publish를 중단해도 release/reset이 old buffers를 정확히 한 번 destroy하고 observer 예외를 보존하는지 검증한다.
- driver lifecycle test에서 spatial → indirect → same-capacity spatial update가 indirect buffer identity를 보존하고 중간 destroy하지 않는지 검증한다.
- driver unmount와 store reset 순서를 바꿔 spatial/meta/indirect buffers가 정확히 한 번 destroy되는지 검증한다.
- StrictMode replay와 sibling cleanup의 reset→release, release→reset 순서가 동일한 최종 empty state와 exact-once destroy를 만드는지 검증한다.
- 변경 source/test ESLint `--no-ignore`, building domain Jest, build/root TypeScript와 `git diff --check`를 실행한다.
- 공개 building store declaration의 additive/widening 변화 때문에 public API/package export focused test를 실행한다.
- 횡단 store/component lifecycle 변경이므로 전체 Jest와 fresh package consumer를 실행한다.
- runtime lifecycle/resource reviewer 감사를 통과한다.

## 완료 조건

- [x] upload resource 최신 record와 terminal dispose 책임의 canonical source가 render store 하나이며 transition retirement는 sync helper가 유지한다.
- [x] 두 upload driver에 resource ownership private ref가 없다.
- [x] 후속 spatial sync가 indirect buffer identity를 유실하거나 누수시키지 않는다.
- [x] reset, release와 unmount 순서에 관계없이 current distinct/non-throwing buffers가 정확히 한 번 destroy된다.
- [x] typed-array, dirty range, queue upload, component/export와 direct setter compatibility에 회귀가 없다.
- [x] focused/domain/type/full/package 검증과 reviewer 결과를 기록한다.
- [x] `HARNESS.md`를 append하고 plan을 completed로 이동한다.

## 구현 결과

- building render store가 최신 upload resource record와 terminal cleanup의 canonical owner가 됐다.
- `setUploadResources`는 direct assignment와 최신 record 기반 functional updater를 모두 지원하고, updater 계산 중 resource action 재진입을 원자적으로 거부한다.
- release/reset은 fresh empty record를 먼저 publish하고 `finally`에서 detached current buffers를 destroy해 subscriber throw에도 cleanup을 보장한다.
- 개별 resize/zero-size buffer retirement는 기존 pure upload sync helper에 남겨 재사용 buffer를 이중 destroy하지 않는다.
- spatial/indirect driver의 경쟁 private ref와 indirect driver의 매-render sync effect를 제거했다.
- spatial → indirect → same-capacity spatial 갱신은 indirect buffer identity를 유지한다.
- StrictMode 첫 mount/replay 두 generation과 reset/unmount 양방향 cleanup이 distinct/non-throwing buffers를 정확히 한 번 정리한다.
- 공개 store export 경로와 기존 action은 유지되고 `releaseUploadResources`와 functional setter parameter만 additive/widening으로 반영됐다.

## 검증 결과

- 변경 source/test ESLint `--no-ignore`, build/root TypeScript와 `git diff --check`: 통과.
- focused lifecycle: 2 suites / 9 tests 통과.
- building domain: 28 suites / 251 tests 통과, 1 suite / 1 test skipped.
- public API/package exports focused: 2 suites / 22 tests 통과.
- 최종 전체 Jest: 198 suites / 1,822 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, strict declarations와 ESM/CJS runtime smoke 통과.
- Vite package consumer bundle: 648 modules 통과.
- 독립 최종 리뷰: blocker 0 / major 0 / minor 0.

## 실패·경고·미실행과 다음 slice

- aliased buffer, throw하는 `destroy()`와 GPU `createBuffer`/`writeBuffer` 예외의 실패 원자성은 명시한 normal distinct/non-throwing device precondition 밖이며 이번 slice에서 변경하지 않았다.
- device 교체, 실제 브라우저 WebGPU, culling readback race와 다른 renderer resource ownership은 제외 범위로 유지했다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- demo, Node 20/22, 비-Windows와 실제 GPU browser validation은 미실행했다.
- 다음 slice는 public renderer factory의 capability single-flight, init failure boundary, R3F 9 dispose compatibility와 OffscreenCanvas 타입 계약을 교정한다.
