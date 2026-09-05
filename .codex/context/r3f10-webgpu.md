# R3F 10 and WebGPU Direction

## 결정

목표 스택은 React Three Fiber 10 alpha, 최신 Three.js, WebGPURenderer, TSL이다. 이 결정은 architecture를 이끄는 기준이지만, 의존성 업그레이드는 API·생태계 호환이 검증된 뒤 전용 migration epoch에서만 수행한다.

## 현재 상태

패키지는 현재 R3F 9.7.0과 Three.js 0.185.1을 사용한다. R3F 10.0.0-alpha.4 / Drei 11.0.0-alpha.6은 임시 프로젝트에서 타입 호환성을 검사 중이며 main package/lockfile에는 아직 반영하지 않았다. `src/next`에는 WebGPU backend가 있고 performance 예제는 CPU와 GPU culling 경로를 모두 실행할 수 있다.

## 호환성 정책

- `LegacyGrid`는 root public API에서 제공하는 기존 Drei Grid의 별칭이다. 예제 Ground도 내부 rendering/legacyDrei와 같은 경로를 사용한다. 현재는 Drei10 root export이고, alpha 타입 probe에서 이 한 파일만 Drei11 /legacy로 가상 치환한다. WebGPU용 Grid로의 전환이나 native renderer 호환을 의미하지 않는다.

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
