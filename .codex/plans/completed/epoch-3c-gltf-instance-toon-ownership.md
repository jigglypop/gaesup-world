# Epoch 3c: GLTF Instance Toon Ownership

## 목표

Drei `useGLTF`가 반환하는 shared cache scene을 read-only asset source로 고정하고, toon projection과 생성 material의 소유권을 각 runtime scene clone으로 이동한다.

## 현재 상태

- `useGltfAndSize()` effect가 `gltf.scene`에 `applyToonToScene()`을 직접 실행해 Drei cache의 canonical source scene을 전역으로 변이한다.
- `SkeletonUtils.clone()`은 object/skeleton은 분리하지만 material을 공유하므로 hook effect와 clone render 순서에 따라 첫 instance와 후속 instance의 외형이 달라질 수 있다.
- `PhysicsEntity`와 `RiderRef`는 source scene을 clone하지만 toon projection과 cleanup을 소유하지 않는다.
- `applyToonToScene()`은 같은 source material이 여러 mesh/slot에서 공유돼도 slot마다 새 `MeshToonMaterial`을 만들고 생성 material을 추적하거나 dispose하지 않는다.
- toon mode를 사용한 URL 전환과 unmount에서 생성 material을 회수하는 canonical path가 없다.

## 범위

- `useGltfAndSize()`에서 source scene toon mutation을 제거하고 size/cache bookkeeping만 유지한다.
- read가 전혀 없고 Drei cache eviction/dispose를 수행하지 않는 local `gltfCache` ref-count retention과 cleanup effect를 제거한다.
- `PhysicsEntity`와 `RiderRef`는 `SkeletonUtils.clone()`으로 만든 instance에만 default toon mode를 projection한다.
- `applyToonToScene(root, steps): void`의 public 이름, parameter와 void 반환 계약을 유지한다.
- 한 root application 안에서 동일 source material은 동일 generated toon material로 dedupe한다.
- root별 source→toon replacement와 generated material ownership을 weak registry에 기록하고 internal cleanup path를 제공한다.
- cleanup은 root가 참조하는 generated material을 원래 source material로 복원한 뒤 생성 material만 각각 최대 한 번 dispose한다.
- instance clone 변경(URL 전환)과 unmount effect cleanup이 해당 root의 generated material을 release한다.
- render 중에는 object/skeleton clone만 만들고 committed clone의 layout effect에서 toon을 적용한 뒤 node projection revision을 갱신해 StrictMode discarded render가 owned material을 만들지 않게 한다.
- source material이 이미 `MeshToonMaterial`이면 그대로 재사용하고 instance가 소유하거나 dispose하지 않는다.
- material array shape, standard material의 color/map/normalMap/alphaMap/emissive/emissiveMap/opacity/side를 기존과 같이 projection한다.
- pure rendering tests와 component lifecycle tests로 source purity, instance isolation, material dedupe와 exact cleanup을 고정한다.

## 제외 범위

- Drei `useGLTF.clear()` 또는 loader cache eviction 정책은 변경하지 않는다.
- source geometry, texture, animation, skeleton, original material과 shared toon gradient의 ownership을 instance로 이동하지 않는다.
- `setDefaultToonMode()`를 reactive store로 바꾸거나 mounted instance의 live on/off 전환 의미를 추가하지 않는다.
- `PartsGroupRef`, `NPCPartGltfMesh`와 다른 독립 GLTF/toon consumer의 별도 ownership 누수는 이번 slice에서 변경하지 않는다.
- `ModelRenderer` tint material, remapped skeleton geometry와 R3F automatic dispose 정책은 변경하지 않는다.
- Blender manifest, asset ID/catalog, streaming, Meshopt/KTX2와 WebGPU renderer 선택은 변경하지 않는다.
- public export 목록이나 package subpath를 추가하지 않는다.

## Source of Truth

- Drei `useGLTF(url).scene`은 URL별 shared asset source이며 모든 consumer가 read-only로 취급한다.
- `PhysicsEntity`와 `RiderRef`가 소유하는 `SkeletonUtils.clone()` root는 runtime projection과 React instance lifetime의 canonical owner다.
- `src/core/rendering/toon.ts`의 root별 weak ownership registry가 apply로 생성한 toon material과 source replacement 관계의 canonical cleanup record다.
- global gradient cache는 계속 `disposeToonGradients()`가 별도로 소유하며 instance cleanup 대상이 아니다.

## 호환성 계약

- `applyToonToScene(...): void`, `createToonMaterial`, gradient/default-mode public symbols와 root import path는 유지한다.
- default toon mode가 켜진 `PhysicsEntity`와 `RiderRef`의 의도된 toon 외형은 유지하되 mount order와 다른 consumer의 cache mutation에 의존하지 않는다.
- default toon mode가 꺼진 clone은 original shared material을 계속 사용하고 instance cleanup은 이를 dispose하지 않는다.
- source textures와 original materials는 clone 간 공유를 유지하며 toon material은 texture reference만 빌려 사용한다.
- cleanup을 반복하거나 apply되지 않은 root를 release해도 no-op이고 generated material은 중복 dispose하지 않는다.
- existing toon root에 apply를 반복해도 material allocation과 replacement가 반복되지 않는다.

## 리스크

- toon application을 다시 source hook에 남기면 cache mutation과 mount-order 결함이 유지된다.
- clone 후 source material identity를 key로 dedupe하지 않으면 material count와 draw batching이 instance mesh slot 수만큼 악화된다.
- generated material과 source texture를 함께 dispose하면 다른 cache consumer의 렌더링이 깨진다.
- already-toon source material을 owned set에 넣으면 shared authoring material을 unmount 때 파괴할 수 있다.
- cleanup record를 dispose 뒤 제거하면 dispose listener의 reentry가 같은 material을 중복 release할 수 있다.
- clone URL 변경 effect가 old root 대신 latest ref를 읽으면 새 generation material을 잘못 dispose할 수 있다.
- render/memo 단계에서 toon material을 만들면 React StrictMode가 폐기한 generation을 cleanup effect가 관찰하지 못한다.
- layout effect에서 clone material을 바꾼 뒤 node projection revision을 갱신하지 않으면 `useGraph`/`ModelRenderer`가 이전 material snapshot을 계속 렌더링할 수 있다.

## 검증

- source scene과 material slots가 apply 대상 clone의 toon 변환 전후에도 identity와 type을 유지하는지 검증한다.
- 서로 다른 두 clone의 generated material이 분리되고 한 clone cleanup이 다른 clone/source에 영향을 주지 않는지 검증한다.
- 같은 source material의 mesh/array slot이 한 root에서 하나의 toon material을 공유하고 정확히 한 번 dispose되는지 검증한다.
- pre-existing toon material, original material, map/normalMap/alphaMap/emissiveMap texture와 shared gradient가 instance cleanup에서 dispose되지 않는지 검증한다.
- repeated apply/cleanup과 cleanup reentry가 generated material exact-once ownership을 유지하는지 검증한다.
- `PhysicsEntity`와 `RiderRef`의 clone 전환/unmount가 old/current root material을 각각 정리하고 source scene을 변이하지 않는지 검증한다.
- StrictMode effect replay에서 render-discard generation은 material을 만들지 않고 각 committed toon generation만 정확히 한 번 dispose되는지 검증한다.
- 변경 source/test ESLint `--no-ignore`, Prettier check, rendering/motions focused Jest, build/root TypeScript와 `git diff --check`를 실행한다.
- public symbols의 runtime/declaration shape를 바꾸지 않지만 root export 회귀를 확인하기 위해 public API/package exports focused test를 실행한다.
- 횡단 hook/component/resource lifetime 변경이므로 memory gate, 전체 Jest와 fresh package consumer를 실행한다.
- runtime resource ownership reviewer 감사를 통과한다.

## 완료 조건

- [x] shared Drei cache scene은 size/read 경로에서 toon mutation을 받지 않는다.
- [x] toon projection은 `PhysicsEntity`/`RiderRef` instance clone에만 적용되고 mount order와 source cache 상태에 독립적이다.
- [x] generated toon material은 source identity별로 dedupe되고 clone 전환/unmount에서 정확히 한 번 dispose된다.
- [x] source material/texture/geometry, pre-existing toon material과 global gradient는 instance cleanup에서 보존된다.
- [x] public toon API와 non-toon/material-array appearance에 회귀가 없다.
- [x] focused/type/memory/full/package 검증과 reviewer 결과를 기록한다.
- [x] `HARNESS.md`를 append하고 plan을 completed로 이동한다.

## 구현 결과

- `useGltfAndSize()`를 Drei GLTF/source identity와 size store만 projection하는 read-only hook으로 복구하고, 읽히지 않던 local `gltfCache` retention을 제거했다.
- `applyToonToScene()`은 root-local source material map으로 material array와 중복 slot을 dedupe하며 authored toon/falsy slot을 그대로 보존한다.
- root별 weak ownership record가 original/projected slot과 generated material을 소유하고 cleanup에서 registry를 먼저 detach한다.
- apply의 traverse/material 생성/slot assignment 실패는 이미 적용한 slot을 rollback하고 모든 generated material을 best-effort 정리한 뒤 원래 error를 보존한다.
- release는 slot별 restore 오류를 격리해 후속 slot과 모든 generated material cleanup을 계속하고 최초 restore/dispose error를 전파한다.
- `PhysicsEntity`와 `RiderRef`는 object/skeleton clone만 render에서 만들고 committed clone의 layout effect에서 toon을 적용한다.
- toon revision으로 stable `useGraph` nodes를 새 projection identity로 바꿔 실제 `ModelRenderer`가 layout 적용 material을 paint 전에 다시 읽는다.
- StrictMode discarded render clone은 owned material을 만들지 않고 setup/cleanup/setup, URL 전환과 unmount의 committed generation만 exact-once release한다.
- `applyToonToScene(...): void`와 기존 explicit root exports는 유지하며 internal release helper는 package root에 노출하지 않았다.

## 검증 결과

- focused toon/hook/entity lifecycle: 3 suites / 11 tests 통과.
- rendering + motions domain: 22 suites / 153 tests 통과.
- public API/package exports: 2 suites / 22 tests 통과.
- 변경 source/test ESLint `--no-ignore`, Prettier check, build/root TypeScript와 `git diff --check`: 통과.
- memory gate: 5 suites / 86 tests 통과.
- 최종 전체 Jest: 202 suites / 1,847 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, strict declarations와 ESM/CJS runtime smoke 통과.
- Vite package consumer bundle: 648 modules 통과.
- reviewer가 cleanup restore exception Major 1건을 찾았고 slot별 격리·전량 dispose·first-error 보존으로 수정한 뒤 독립 최종 재리뷰 blocker 0 / major 0 / minor 0.

## 실패·경고·미실행과 다음 slice

- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- `NPCPartGltfMesh`와 `PartsGroupRef`의 독립 toon/tint ownership, live toon-mode toggle, Drei cache eviction과 URL별 size initialization은 제외 범위로 유지했다.
- demo, Node 20/22, 비-Windows, 실제 GLTF/SkinnedMesh Canvas와 browser GPU material memory 관측은 미실행했다.
- 다음 slice는 experimental `createThreeWebGpuBackend()`의 init/post-init phase와 성공 renderer의 exact-once cleanup을 분리하되 Three r178 부분 init의 안전하지 않은 dispose 한계를 명시한다.
