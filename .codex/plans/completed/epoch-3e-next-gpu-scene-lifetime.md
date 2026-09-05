# Epoch 3e: Next GPU Scene Lifetime

## 목표

`NextCorePage`의 raw Three WebGPU 초기화를 public `gaesup-world/next` backend factory 소비로 전환하고, pending async setup·animation loop·GPU scene resource를 effect generation 하나의 exact-once cleanup 경계로 통합한다.

## 현재 상태

- `GpuScene`은 `createGpuCulledInstances()` 뒤 `three/webgpu`를 직접 import하고 renderer를 construct/init해 library consumer가 3d의 canonical backend boundary를 우회한다.
- unmount가 renderer init 중 발생하면 effect cleanup은 아직 비어 있고, resolve continuation이 geometry와 animation loop를 다시 만들어 zombie renderer/loop를 남긴다.
- dynamic import, init, post-init setup과 loop Promise rejection이 `void setup()` 밖으로 누출되며 이미 획득한 culled/backend/geometry resource를 정리하지 못한다.
- cleanup 중 하나의 disposer가 throw하면 뒤 resource cleanup이 중단되고 reentry에 대한 exact-once guard가 없다.
- Three r178 `setAnimationLoop()`는 `Promise<void>`지만 local type은 `void`여서 start/stop rejection을 관찰하지 않는다.
- 3d factory의 initial `setSize(width,height)`는 canvas inline size를 px로 바꿀 수 있어 현재 `100%` responsive style을 복원해야 한다.

## 범위

- `createThreeWebGpuBackend`를 `gaesup-world/next` public specifier에서 import하고 raw `three/webgpu` import·constructor·init을 제거한다.
- effect 시작부터 `cancelled`, culled backend, renderer backend, geometry와 loop-request owner slot을 만들고 하나의 terminal release path를 설치한다.
- 각 await 결과를 owner slot에 획득한 직후 cancellation을 검사해 late settle resource를 즉시 release한다.
- owner slot과 loop flag를 external disposer 호출 전에 detach하고 stop-loop, geometry, culled, backend cleanup을 각각 독립적으로 시도한다.
- renderer가 살아 있는 동안 loop를 detach하고 geometry disposal event가 전달되도록 loop → geometry → culled → backend 순서를 유지한다.
- loop start/stop Promise rejection을 처리하고 start rejection이 아직 active인 generation을 terminal cleanup으로 전환하도록 한다.
- setup/cleanup 오류를 existing public project logger로 기록하되 정상 cancellation과 capability `null`은 오류로 기록하지 않는다.
- factory가 변경한 canvas inline width/height를 기존 responsive 값으로 복원하고 이를 회귀 테스트로 고정한다.
- deferred factory/culled Promise와 lightweight Three mocks로 unmount timing, failure, cleanup throw, loop rejection, StrictMode generation을 검증한다.

## 제외 범위

- 3d backend factory signature/options와 `src/next` public API를 변경하지 않는다.
- Three private backend/device/context/listener, init-reject partial renderer와 actual WebGPU device loss를 정리하지 않는다.
- `createGpuCulledInstances()` 내부 storage attribute·buffer ownership을 바꾸지 않는다.
- animation callback 내부 compute/render error policy와 resize observer를 추가하지 않는다.
- `/performance`, `/next`, `?gpu` route와 product/developer UX를 변경하지 않는다.
- Three/R3F dependency를 업그레이드하지 않는다.

## Source of Truth

- Three renderer capability/import/constructor/init과 initialized backend lifetime은 `src/next/backend/threeWebGpuBackend.ts`가 canonical source다.
- `GpuScene` effect generation은 culled result, returned backend, geometry와 requested animation loop의 React-lifetime owner다.
- effect terminal release path만 owner slot을 detach/dispose하며 late async continuation과 error handler는 같은 path로 수렴한다.
- world entity/typed-array state와 GPU culling algorithm은 기존 `NextWorld`/`createGpuCulledInstances` source를 유지한다.

## 호환성 계약

- examples는 `gaesup-world`와 `gaesup-world/next` public specifier만 사용한다.
- `/next?gpu`와 `/performance?gpu`의 route, canvas markup, `100%` responsive inline style와 fallback UI를 유지한다.
- capability unavailable 또는 backend `null`은 기존처럼 GPU scene을 생성하지 않고 조용히 종료한다.
- initialized renderer의 `native` escape hatch는 page의 scene/compute/render integration에만 좁게 사용하고 terminal cleanup은 backend facade로 수행한다.
- setup 실패와 cleanup failure를 격리하되 acquired resource마다 dispose attempt는 최대 한 번이다.

## 리스크

- cancellation 검사 전에 owner slot을 등록하지 않으면 await 직후 unmount에서 resource가 유실된다.
- disposer call 전에 slot을 detach하지 않으면 throw/reentry가 중복 cleanup을 만든다.
- loop start Promise rejection handler가 이미 released generation을 다시 정리하면 duplicate disposal이 발생한다.
- backend dispose보다 geometry를 늦게 dispose하면 renderer가 GPU-side disposal event를 처리할 기회를 잃는다.
- factory의 default `setSize` style update를 복구하지 않으면 full-size canvas가 fixed pixel layout으로 회귀한다.

## 검증

- culled pending/backend pending 중 unmount와 late resolve의 C/R/G/L exact-once 행렬을 검증한다.
- backend null/reject, post-init setup failure, geometry 뒤 failure와 loop start rejection에서 모든 acquired resource가 정리되는지 검증한다.
- normal unmount와 disposer throw에서 loop stop, geometry, culled와 backend cleanup이 서로를 막지 않는지 검증한다.
- unmount 뒤 pending loop Promise rejection과 StrictMode generation별 resource가 재정리되지 않는지 검증한다.
- factory 호출 뒤 canvas inline width/height가 `100%`를 유지하는지 검증한다.
- changed examples source/test ESLint `--no-ignore`, Prettier, root TypeScript, focused Jest와 `git diff --check`를 실행한다.
- examples public consumption/route focused tests, `test:demo`, 전체 Jest와 runtime resource ownership reviewer를 실행한다.
- public library API와 declaration은 변경하지 않으므로 fresh package build는 regression이 의심될 때만 실행한다.

## 완료 조건

- [x] `GpuScene`이 raw renderer init 대신 public 3d backend factory를 소비한다.
- [x] pending setup과 late settle은 zombie loop/resource를 만들지 않고 acquired handles를 exact-once 정리한다.
- [x] loop Promise와 setup/disposer 오류가 unhandled rejection 또는 cleanup short-circuit를 만들지 않는다.
- [x] responsive canvas style과 route/fallback compatibility가 유지된다.
- [x] focused/type/demo/full 검증과 independent reviewer 결과를 기록한다.
- [x] `HARNESS.md`를 append하고 plan을 completed로 이동한다.

## 완료 결과

- `GpuScene`은 public `createThreeWebGpuBackend()`만으로 initialized renderer를 획득하고 raw `three/webgpu` import·constructor·init을 제거했다.
- effect generation의 culled/backend/geometry/loop owner slot은 external cleanup 전에 전부 detach되며 late settle도 같은 release path에서 handle별 exact-once 정리된다.
- start/stop loop Promise, synchronous setup, disposer와 logger 예외는 격리되고 stale callback은 cancellation 뒤 GPU resource를 다시 사용하지 않는다.
- backend factory settle과 pixel ratio setup 뒤 canvas inline width/height를 `100%`로 복원해 기존 responsive route layout을 유지했다.
- focused lifecycle 1 suite / 15 tests와 public examples consumption·route 2 suites / 20 tests가 통과했다.
- 변경 파일 ESLint `--no-ignore`, Prettier, root TypeScript와 targeted `git diff --check`가 통과했다.
- demo package surface는 Vite 1,616 modules와 chunk verification이 통과했다.
- 최종 전체 Jest 204 suites / 1,872 tests가 통과했고 1 suite / 1 test는 기존 skip이다.
- 독립 read-only 최종 리뷰 결과는 blocker 0 / major 0 / minor 0이며 residual은 실제 browser WebGPU/device loss/GPU memory/layout 관측 1건이다.
- public library source·declaration을 변경하지 않아 fresh package consumer와 memory gate는 미실행했다.
