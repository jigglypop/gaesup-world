# Epoch 3b: Renderer Factory Compatibility Boundary

## 목표

공개 `createRenderer`/`isWebGPUAvailable` 경계를 R3F 9와 Three r178의 실제 계약에 맞춰 capability probe, failure fallback, renderer disposal과 canvas 타입을 결정론적으로 만든다.

## 현재 상태

- `isWebGPUAvailable()`은 완료된 boolean만 캐시해 동시 호출마다 `requestAdapter()`를 시작하고, 서로 다른 결과와 마지막 완료 순서에 의존하는 영구 캐시를 만들 수 있다.
- `createRenderer()`의 하나의 `try/catch`가 dynamic import, constructor와 `renderer.init()`을 모두 삼킨다.
- Three r178 `WebGPURenderer.init()`은 자체 WebGL2 fallback까지 시도하므로 init failure 뒤 legacy `WebGLRenderer`를 다시 만들면 context 시도를 중복하고 원래 오류를 다른 오류로 가린다.
- init에 성공한 `WebGPURenderer`에는 R3F 9 unmount가 호출하는 `forceContextLoss()`가 없고 R3F 9는 `gl.dispose()`를 호출하지 않아 renderer lifecycle이 끝나지 않는다.
- factory input은 global `HTMLCanvasElement`만 허용하지만 R3F 9 `DefaultGLProps.canvas`는 `HTMLCanvasElement |` module-local minimal `OffscreenCanvas`라 문서의 `<Canvas gl={createRenderer}>`가 strict TypeScript에서 컴파일되지 않는다.
- package consumer는 공개 문서의 Canvas factory 계약을 compile fixture로 검증하지 않는다.

## 범위

- availability cache를 완료 boolean 대신 하나의 in-flight/settled `Promise<boolean>`로 바꿔 동시 호출이 동일 probe와 결과를 공유하게 한다.
- navigator/gpu/adapter 부재와 probe reject는 기존처럼 `false`로 resolve하고 그 결과를 캐시한다.
- WebGPU unavailable은 기존 legacy WebGL renderer와 기본 antialias/power preference를 유지한다.
- dynamic import, missing constructor와 constructor failure까지만 legacy WebGL fallback을 허용한다.
- 생성된 `WebGPURenderer.init()` failure는 Three 내부 fallback 실패의 원래 오류를 그대로 reject하고 두 번째 legacy renderer를 만들지 않는다.
- init 성공 renderer의 native `dispose()`와 R3F 9의 `forceContextLoss()`를 동일한 dispose-once closure에 연결한다.
- R3F factory object에 runtime으로 남을 수 있는 WebGL `context`와 WebGPU가 허용하지 않는 `powerPreference: 'default'`를 WebGPU constructor boundary에서 제거한다.
- initialized renderer에 disposal compatibility를 설치할 수 없는 descriptor/extensibility 상태는 preflight하고, 설치 실패 시 captured native dispose를 best-effort 한 번 수행한 뒤 원래 installation error를 reject한다.
- public factory input을 Three renderer props에서 독립적으로 정의하되 canvas를 R3F 9 module-local minimal OffscreenCanvas와 구조적으로 호환되는 `EventTarget` boundary로 widen한다. R3F-specific public type import는 declaration에서 제거하고, minimal canvas와 Three의 global OffscreenCanvas 차이는 renderer constructor 직전의 좁은 compatibility cast에만 격리한다.
- rendering API/performance guide의 fallback과 lifecycle 설명을 실제 계약에 맞춘다.
- ESM/CJS package consumer fixture에서 `<Canvas gl={createRenderer}>`가 strict와 exact-optional 양쪽 declaration 경로로 컴파일되게 한다.

## 제외 범위

- R3F 10, Three와 관련 dependency를 업그레이드하지 않는다.
- `ProjectSettings.rendering.backend`를 renderer selection에 연결하지 않는다.
- `src/next`의 experimental backend와 public factory를 통합하거나 변경하지 않는다.
- WebGPU unavailable 시 `WebGPURenderer({ forceWebGL: true })`를 사용하는 backend 교체는 하지 않는다.
- 부분 init renderer의 private device/context fields에 접근하거나 init 전 best-effort `dispose()`를 호출하지 않는다.
- TSL, ShaderMaterial, EffectComposer, postprocessing과 building GPU upload/culling 경로는 변경하지 않는다.
- actual browser/device WebGPU integration과 R3F 10 disposal semantics는 이번 slice의 unit/package 계약 밖이다.

## Source of Truth

- capability detection, renderer selection/fallback과 R3F 9 renderer-lifetime compatibility는 계속 `src/core/rendering/webgpu.ts`가 canonical source다.
- 동일 module lifetime의 availability probe/result는 cached promise 하나가 소유한다.
- 성공한 renderer를 반환한 뒤 일반 scene lifetime은 Canvas/consumer가 소유하고 dispose/forceContextLoss 어느 경로도 native dispose를 한 번만 종료시킨다.
- Three r178 `WebGPURenderer.init()`이 WebGPU→WebGL2 내부 backend fallback의 authority이며 public factory는 init 실패 뒤 별도 fallback을 반복하지 않는다.

## 호환성 계약

- public symbol names, root import path와 async factory signature는 유지한다.
- renderer-independent structural input widening은 기존 `HTMLCanvasElement`와 real global OffscreenCanvas caller를 수용하면서 R3F 9의 module-local minimal OffscreenCanvas callback에도 assignable하다.
- 허용 peer R3F 8에서는 async Canvas runtime을 새로 지원하지 않지만, emitted declaration이 R3F 9-only root type export를 요구하지 않는다.
- WebGPU unavailable, import unavailable와 constructor failure는 legacy WebGL 반환을 유지한다.
- legacy renderer의 antialias/powerPreference default와 explicit caller values를 유지한다.
- 성공한 WebGPU renderer의 render behavior는 유지하고 cleanup method만 idempotent compatibility로 보강한다.
- 변경되는 failure behavior는 Three 내부 fallback까지 실패한 `init()` 오류를 가리지 않고 그대로 전파하는 경우뿐이다.
- availability concurrent callers는 같은 boolean 결과와 adapter request 한 번을 관찰한다.

## 리스크

- promise를 probe 완료 뒤 지우면 동시성은 해결해도 매 호출 adapter request가 반복된다.
- rejected probe promise를 그대로 cache하면 public API가 기존 false-resolve 대신 reject할 수 있다.
- init까지 broad catch하면 원래 오류 은닉과 중복 context 생성이 남는다.
- init failure renderer에 best-effort dispose를 호출하면 Three의 부분 초기화 null fields에서 새 오류를 만들 수 있다.
- native dispose를 bound 하지 않으면 wrapper 호출에서 renderer `this`가 유실될 수 있다.
- disposed flag를 native call 뒤에 바꾸면 dispose throw/reentry가 중복 native cleanup을 만들 수 있다.
- 기존 또는 미래 method descriptor를 고려하지 않고 compatibility method를 설치하면 assignment가 실패할 수 있다.
- compatibility 설치 실패를 그대로 reject하면 이미 init된 renderer가 caller에게 반환되지 않은 채 누수될 수 있고, cleanup 오류가 installation 오류를 덮을 수 있다.
- type-level `Omit<'context'>`만 사용하면 R3F가 전달한 runtime object의 extra `context` property는 사라지지 않는다.
- package probe가 단순 function call만 하면 실제 R3F `gl` prop variance와 OffscreenCanvas 입력 오류를 놓친다.
- global `HTMLCanvasElement | OffscreenCanvas`만 선언하면 R3F module-local minimal OffscreenCanvas와 이름은 같아도 unrelated structural type이라 TS2322가 남는다.
- R3F `GLProps`를 emitted declaration에서 직접 import하면 해당 root type export가 없는 허용 peer R3F 8 consumer가 TS2305로 깨진다.
- minimal `EventTarget` canvas boundary는 arbitrary non-canvas EventTarget도 type상 허용하므로 caller는 Three-compatible HTML/Offscreen canvas를 전달해야 한다.

## 검증

- concurrent availability N calls가 requestAdapter 한 번과 같은 결과를 공유하고 settled cache도 재사용하는지 검증한다.
- navigator/gpu/adapter 부재와 probe rejection이 false로 resolve되는지 검증한다.
- unavailable/import/missing-constructor/constructor-failure가 legacy WebGL defaults와 explicit props를 보존하는지 검증한다.
- init reject가 legacy renderer를 만들지 않고 동일 error object를 전파하는지 검증한다.
- success renderer의 direct dispose, forceContextLoss와 두 순서 조합이 native dispose를 정확히 한 번 호출하는지 검증한다.
- WebGPU constructor가 runtime `context`와 `'default'` power preference를 받지 않는지 검증한다.
- non-extensible/non-configurable renderer의 compatibility 설치 실패가 native dispose를 best-effort 한 번 수행하고 원래 error를 유지하며 WebGL fallback하지 않는지 검증한다.
- ESM/CJS package consumer의 실제 `<Canvas gl={createRenderer}>` compile fixture를 strict와 `exactOptionalPropertyTypes` false/true에서 검증한다.
- emitted ESM/CJS renderer declaration이 version-specific `@react-three/fiber` type import를 포함하지 않는지 package verifier로 고정한다.
- 변경 source/test/script ESLint `--no-ignore`, script `node --check`, rendering focused Jest, public API/package exports, build/root TypeScript와 `git diff --check`를 실행한다.
- 전체 Jest, fresh package consumer와 Vite bundle을 실행한다.
- runtime WebGPU/lifecycle reviewer 감사를 통과한다.

## 완료 조건

- [x] capability probe가 module lifetime single-flight/settled cache이며 concurrent 결과가 결정론적이다.
- [x] fallback은 availability/import/constructor boundary에만 있고 init failure 원인이 보존된다.
- [x] 성공한 WebGPU renderer가 direct/R3F 9 cleanup 조합에서 native dispose를 한 번만 실행한다.
- [x] public factory가 R3F 9 HTMLCanvasElement/module-local OffscreenCanvas `gl` prop과 strict ESM/CJS에서 호환되고 declaration은 R3F 9-only type export를 요구하지 않는다.
- [x] public symbols, legacy fallback defaults와 excluded renderer paths에 회귀가 없다.
- [x] focused/type/full/package 검증과 reviewer 결과를 기록한다.
- [x] `HARNESS.md`를 append하고 plan을 completed로 이동한다.

## 구현 결과

- availability는 module lifetime의 in-flight/settled `Promise<boolean>` 하나를 canonical cache로 사용하며 probe 부재·실패를 cached `false`로 정규화한다.
- WebGL fallback을 capability/import/missing-constructor/constructor failure로 제한하고, `WebGPURenderer.init()` reject는 원래 error identity를 유지한 채 전파한다.
- WebGPU constructor 경계에서 R3F runtime `context`와 `powerPreference: 'default'`를 제거한다.
- init 성공 renderer의 native `dispose()`와 R3F 9 `forceContextLoss()`를 reentry/throw에도 exact-once인 closure로 통합한다.
- compatibility method 설치가 불가능하면 initialized renderer를 best-effort native dispose한 뒤 원래 installation error를 보존하고 WebGL로 fallback하지 않는다.
- public factory input을 Three parameter와 `canvas: EventTarget`의 R3F-independent structural boundary로 정의해 R3F 9 Canvas 호환을 유지하면서 R3F 8에 없는 root type export 의존을 제거했다.
- package verifier가 ESM/CJS renderer declaration의 R3F import 부재와 두 public symbol의 runtime function export를 고정한다.

## 검증 결과

- renderer focused: 1 suite / 14 tests 통과.
- rendering domain: 3 suites / 21 tests 통과.
- public API/package exports: 2 suites / 22 tests 통과.
- 변경 source/test/script ESLint `--no-ignore`, Prettier check, build/root TypeScript, script `node --check`와 `git diff --check`: 통과.
- memory gate: 5 suites / 86 tests 통과.
- 최종 전체 Jest: 199 suites / 1,836 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, strict/exact-optional false·true Canvas declaration과 ESM/CJS runtime smoke 통과.
- Vite package consumer bundle: 648 modules 통과.
- 실제 R3F 8.17.10 + React 18 + Three 0.178 strict declaration 최소 소비자: 통과, 기존 TS2724/TS2305 해소.
- 독립 최종 재리뷰: blocker 0 / major 0 / minor 0.

## 실패·경고·미실행과 다음 slice

- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- R3F 8의 async Canvas runtime은 지원 계약이 아니며 이번 검증은 version-specific declaration import가 없는지에 한정했다.
- demo, Node 20/22, 비-Windows, 실제 브라우저 WebGPU device/context와 실제 R3F timer 기반 unmount integration은 미실행했다.
- `src/next/backend/threeWebGpuBackend.ts`의 부분 init cleanup 판단과 R3F 10 migration은 제외 범위로 유지했다.
- 다음 slice는 Drei GLTF cache scene의 toon mutation을 제거하고 per-instance clone과 생성 material의 exact ownership/dispose 경계를 만든다.
