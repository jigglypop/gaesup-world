# R3F 10 and WebGPU Direction

## 결정

목표 스택은 React Three Fiber 10 alpha, 최신 Three.js, WebGPURenderer, TSL이다. 이 결정은 architecture를 이끄는 기준이지만, 의존성 업그레이드는 API·생태계 호환이 검증된 뒤 전용 migration epoch에서만 수행한다.

## 현재 상태

패키지는 현재 R3F 9와 Three.js 0.178을 사용한다. `src/next`에는 이미 WebGPU backend가 있고 performance 예제는 CPU와 GPU culling 경로를 모두 실행할 수 있다.

## 호환성 정책

- WebGPU가 목표 primary backend다.
- WebGL은 명시적 fallback이자 차분 테스트용 backend로 유지한다.
- renderer-neutral 계약은 WebGLRenderer를 노출하지 않는다.
- 기존 GLSL과 EffectComposer 경로는 migration 인벤토리이지 자동 삭제 대상이 아니다.
- 실제 R3F 10과 WebGPURenderer 동작을 확인하기 전에 기계적으로 API를 rename하지 않는다.

## 현재 blocker 인벤토리

- `useThree`가 building, camera, performance, fog, interaction, NPC, UI 경로 전반에서 사용된다.
- snow와 sakura 렌더링에 직접적인 `state.gl` 접근이 있다.
- water, snow, bloom, sakura, flag, grass, fire에 ShaderMaterial 기반 경로가 있다.
- LUT, color grade, outline 경로에 EffectComposer 기반 postprocessing이 있다.
- `src/next`, performance 감지, WebGPU 유틸리티에 renderer 메서드 호출이 있다.

Epoch 3·4에서 각 사용처를 renderer-neutral, WebGL-specific, WebGPU blocker, compatibility-only로 분류한다.
