# Epoch 3d: Next WebGPU Backend Lifecycle

## 목표

Experimental `gaesup-world/next`의 Three `WebGPURenderer` facade factory를 init phase와 post-init ownership phase로 분리해, 공개적으로 안전한 범위에서 실패 cleanup과 반환 backend의 exact-once lifetime을 고정한다.

## 현재 상태

- `createThreeWebGpuBackend()`의 하나의 catch가 import, constructor, `init()`과 init 성공 뒤 `setSize()` 실패를 모두 `null`로 삼킨다.
- init 성공 뒤 `setSize()`가 throw하면 안전하게 dispose 가능한 renderer reference가 유실되어 누수된다.
- 반환 `dispose()`는 native dispose를 반복 호출하고 dispose 뒤 `resize()`도 renderer를 다시 건드린다.
- Three r178 `Renderer.dispose()`는 init 전/부분 실패 상태의 null subsystem을 무조건 접근해 별도 TypeError를 만들 수 있다.
- Three r178은 WebGPU backend init 실패 뒤 내부 WebGL fallback으로 backend를 교체할 수 있고, 이미 생성한 이전 backend/device를 공개 API로 회수할 방법이 없다.
- `RendererBackend.kind: 'webgpu'`가 실제 resolved GPU backend인지 Three WebGPURenderer facade 계약인지 문서화돼 있지 않다.
- `gaesup-world/next`의 두 backend public function은 ESM/CJS named runtime smoke에 포함되지 않는다.

## 범위

- navigator GPU presence gate, dynamic import, constructor, init과 post-init setup을 독립 phase로 분리한다.
- navigator 또는 `gpu` getter가 throw하면 availability를 `false`로 정규화한다.
- capability/import/constructor/init failure는 기존처럼 `null`을 반환한다.
- init reject에서는 Three r178의 unsafe partial renderer `dispose()`를 호출하지 않는다.
- init 성공 뒤 `setSize()` failure는 captured native dispose를 best-effort 정확히 한 번 호출하고 기존 `null` result를 유지한다.
- 성공 backend는 disposed flag를 native call 전에 세워 dispose throw/reentry에도 native dispose를 최대 한 번만 호출한다.
- dispose 이후 `resize()`는 no-op으로 만들어 disposed renderer를 다시 사용하지 않는다.
- `RendererBackend.kind: 'webgpu'`는 resolved adapter가 아니라 Three `WebGPURenderer` facade/backend-family discriminator임을 type/function 문서에 명시한다.
- focused tests로 capability/import/constructor/init/post-init/success lifecycle 행렬을 고정한다.
- package verifier의 ESM/CJS named runtime module에 `NextWorld`, `createThreeWebGpuBackend`, `isWebGpuAvailable`을 추가하고 함수 export를 확인한다.

## 제외 범위

- Three r178 private `_backend`, fallback closure, device/context/listener에 접근하지 않는다.
- arbitrary partial init에서 생성된 GPU device/context/listener를 완전 정리한다고 주장하지 않는다.
- Three dependency를 업그레이드하거나 자체 `GPUDevice`를 요청·주입해 WebGPURenderer feature negotiation을 재구현하지 않는다.
- Three 내부 WebGL fallback을 판별·거부하거나 `kind` union에 별도 resolved backend를 추가하지 않는다.
- `src/core/rendering/webgpu.ts`의 R3F public factory를 통합하거나 변경하지 않는다.
- `createGpuCulledInstances`, RenderGraph, compute/culling buffer ownership은 변경하지 않는다.
- `examples/pages/NextCorePage.tsx`의 raw renderer async unmount race는 별도 slice로 남긴다.
- actual browser WebGPU device/context destruction과 memory 관측은 unit/package 검증 범위 밖이다.

## Source of Truth

- `src/next/backend/threeWebGpuBackend.ts`가 next Three renderer facade의 capability gate, phase transition과 renderer ownership source다.
- init 성공 전에는 renderer를 caller가 소유하지 않으며 public-safe cleanup이 없다는 Three r178 limitation을 유지한다.
- init 성공 뒤 local dispose-once closure가 renderer native lifetime의 canonical terminal path다.
- 반환 `RendererBackend`는 dispose 전까지만 resize 가능한 facade이며 `native` object의 추가 사용은 caller 책임인 compatibility escape hatch다.

## 호환성 계약

- `isWebGpuAvailable(): boolean`, `createThreeWebGpuBackend(options): Promise<RendererBackend | null>`와 `gaesup-world/next` import path를 유지한다.
- navigator GPU object 부재와 import/constructor/init failure의 `null` fallback을 유지한다.
- options canvas/width/height와 constructor `antialias: true`, 초기 `setSize(width,height)`를 유지한다.
- 성공 result의 `kind: 'webgpu'`, `native`, `resize`, `dispose` shape를 유지한다.
- 새 보장으로 post-init setup failure는 renderer를 best-effort 정리하고 반복 dispose와 post-dispose resize는 native renderer를 다시 호출하지 않는다.
- `kind`는 Three WebGPURenderer facade를 뜻하며 Three 내부 WebGL fallback 가능성을 숨기지 않는다.

## 리스크

- init reject에서 dispose를 호출하면 원래 error를 Three null-subsystem TypeError로 가리고 cleanup도 완성하지 못한다.
- init과 setSize를 같은 catch로 유지하면 안전하게 정리 가능한 성공 renderer까지 유실된다.
- disposed flag를 native dispose 뒤에 세우면 throw/reentry가 중복 native cleanup을 만든다.
- native dispose error가 post-init setup error 또는 factory의 `null` contract를 바꾸면 compatibility가 깨진다.
- `kind`를 실제 WebGPU device 증명으로 해석하면 Three 내부 fallback과 UI capability 표현이 잘못된다.
- exact-once wrapper가 `native` escape hatch를 통한 caller의 직접 dispose까지 통제할 수는 없다.

## 검증

- navigator/gpu 부재와 throwing getter가 false/null이며 module import를 시작하지 않는지 검증한다.
- dynamic import/missing constructor/constructor throw가 null이고 생성되지 않은 resource cleanup을 시도하지 않는지 검증한다.
- init reject가 null을 반환하고 partial renderer dispose를 호출하지 않는지 검증한다.
- init 성공 뒤 initial `setSize` throw가 native dispose를 정확히 한 번 시도하고 dispose throw를 삼킨 채 null을 유지하는지 검증한다.
- 성공 renderer의 constructor props와 initial/후속 resize를 검증한다.
- dispose 직접·반복·throw·reentry와 dispose 후 resize가 native dispose exact-once/no-resize 계약을 지키는지 검증한다.
- `kind`와 public function signature/runtime export가 유지되는지 public/package fixture로 검증한다.
- 변경 source/test/script ESLint `--no-ignore`, Prettier, script `node --check`, next focused Jest, build/root TypeScript와 `git diff --check`를 실행한다.
- public next subpath runtime contract이므로 public API/package exports, 전체 Jest와 fresh package consumer를 실행한다.
- runtime resource ownership reviewer 감사를 통과한다.

## 완료 조건

- [x] init 전/부분 실패와 init 성공 뒤 실패의 cleanup 정책이 phase별로 분리된다.
- [x] post-init setup 실패는 initialized renderer를 best-effort exact-once 정리하고 null compatibility를 유지한다.
- [x] 성공 backend dispose는 throw/reentry에도 native exact-once이며 dispose 후 resize는 no-op이다.
- [x] `kind`의 facade 의미와 Three r178 partial-init/device cleanup 한계가 문서화된다.
- [x] ESM/CJS next named runtime exports와 기존 public signature가 검증된다.
- [x] focused/type/full/package 검증과 reviewer 결과를 기록한다.
- [x] `HARNESS.md`를 append하고 plan을 completed로 이동한다.

## 완료 결과

- capability/import/constructor/init/post-init 단계를 분리하고 init reject에서는 Three r178 partial renderer를 dispose하지 않았다.
- initial `setSize()` 실패와 성공 backend 종료는 dispose flag를 native call 전에 세우는 하나의 exact-once terminal path를 사용한다.
- dispose 뒤 resize는 no-op이며 `kind: 'webgpu'`의 facade 의미와 `native` escape hatch 한계를 공개 타입·factory 문서에 명시했다.
- focused 1 suite / 10 tests, 전체 `src/next` 7 suites / 50 tests, public/package 2 suites / 22 tests가 통과했다.
- 변경 파일 ESLint `--no-ignore`, Prettier, script syntax, build/root TypeScript와 `git diff --check`가 통과했다.
- memory gate 5 suites / 86 tests와 전체 Jest 203 suites / 1,857 tests가 통과했고 1 suite / 1 test는 기존 skip이다.
- fresh package ESM/CJS 각각 916 modules, npm consumer 95 packages, strict declaration·named runtime smoke와 648-module Vite consumer build가 통과했다.
- 독립 read-only 최종 리뷰 결과는 blocker 0 / major 0 / minor 0이다.
- 실제 browser WebGPU device/context, Three r178 partial-init 내부 resource, `native` 직접 dispose, Node 20/22와 비-Windows는 검증하지 않았다.
- demo surface는 examples route/source를 변경하지 않아 미실행했으며 다음 slice에서 `NextCorePage`를 변경할 때 실행한다.
