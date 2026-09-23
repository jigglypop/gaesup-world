# PRD-19 렌더링과 WebGPU

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 트랙 | Epoch (렌더러 교체, peer 의존성 변경) |
| 선행 PRD | 11 (이펙트 드라이버) |
| 관련 active plan | `renderer-modernization` (이 PRD의 실행 plan) |

## 1. 배경과 문제

- `renderer-modernization` plan 기록(2026-09-05): 날씨와 눈 효과에 WebGPU 노드 경로가 있고 WGSL/GLSL 생성 테스트가 통과했다. **메인 World Canvas는 아직 기본(WebGL) 렌더러**이고, `GpuSnow`는 `ShaderMaterial`, 후처리는 WebGL 기반이다. 네이티브 GPU 실행과 픽셀 비교는 미완이다.
- `project-settings.rendering.backend: 'auto' | 'webgl' | 'webgpu'` 스키마가 있지만 렌더러 선택에 연결되어 있지 않다(연결 여부 확인 필요).
- peer 의존성 `@react-three/postprocessing`은 WebGL 전용 파이프라인이다.
- `rendering/tsl/*`에 TSL 코드 일부가 있다. 이펙트 메시(fire, water, sakura, flag, billboard, snowfield, sand)는 크기가 크고(370~809줄) 셰이더 방식이 섞여 있다.
- `src/next`에 WebGPU/data-oriented 실험 코어(TaskGraph, RenderGraph, culling)가 분리되어 있다.
- `BuildingGpuCullingDriver`(WebGPU compute, CPU 폴백)가 있다.

## 2. 목표 / 비목표

### 목표
1. 메인 World가 `WebGPURenderer`로 동작하고, 미지원 환경에서 WebGL2로 자동 폴백한다.
2. 모든 커스텀 셰이더가 TSL 하나의 소스에서 WGSL/GLSL을 생성한다.
3. 후처리가 TSL 노드 파이프라인으로 동작한다(bloom, color grade/LUT, outline, tone mapping).
4. 스타일 렌더 프리셋(toon, cozy)을 project-settings로 선택한다.
5. 렌더 백엔드 선택이 project-settings를 따른다.

### 비목표
- 레이트레이싱, GI 베이크. P3.
- 가우시안 스플랫 1차 범위 제외 (PRD-20 에셋 타입 예약만).

## 3. 요구사항

| ID | 요구사항 |
|---|---|
| FR-1 | `backend: 'auto'`는 WebGPU 가능 시 WebGPU, 아니면 WebGL2. 선택 결과를 perf 패널과 로그에 표시 |
| FR-2 | 이펙트 메시 셰이더 TSL 포팅: fire, water, sakura, flag, billboard, snow, snowfield, sand, grass |
| FR-3 | 후처리 파이프라인: 노드 기반 bloom, LUT, outline, tone mapping. project-settings `postprocessing` 플래그 연결 |
| FR-4 | toon/cozy 프리셋: 조명, 머티리얼, 팔레트, 후처리 묶음 |
| FR-5 | GPU 컬링을 building 외 인스턴스 렌더(나무, 소품)에도 적용 |
| FR-6 | 렌더 통계: draw call, 삼각형 수, 텍스처 메모리 추정, 백엔드 |
| NFR-1 | 데모 World 기준 WebGPU 경로 FPS가 WebGL 경로 이상 (같은 장치, 측정 기록) |
| NFR-2 | 백엔드별 시각 차이: 스크린샷 픽셀 비교 임계값 이내 |
| NFR-3 | 초기 JS 번들 증가 10% 이하 (WebGPU 경로는 지연 로드) |

## 4. 설계

### 4.1 렌더러 선택

```
project-settings.rendering.backend
      ↓
createRenderer(settings) : WebGPURenderer | WebGLRenderer
      ↓
<Canvas gl={createRenderer}>
```

- three.js `WebGPURenderer`는 자체적으로 WebGL2 폴백 백엔드를 갖는다. `'auto'`는 이것을 그대로 쓴다. `'webgl'`은 레거시 `WebGLRenderer`를 강제한다(호환 모드).
- R3F 9에서 비동기 렌더러 초기화를 쓰는 방식은 현재 날씨/눈 경로의 "renderer marker" 패턴을 확장한다.

### 4.2 셰이더 소유 규칙
- 새 셰이더는 `rendering/tsl/`에만 둔다. 이펙트 컴포넌트는 노드 머티리얼 팩토리를 호출한다.
- 공유 시간 uniform은 PRD-11 이펙트 드라이버가 갱신한다.

### 4.3 후처리
- `@react-three/postprocessing`을 WebGL 호환 모드 전용으로 격리한다.
- WebGPU 경로는 three.js 노드 후처리(`PostProcessing` + pass 노드)를 쓴다.
- 2.0에서 `@react-three/postprocessing` peer를 optional peer로 내린다(`peerDependenciesMeta.optional`).

### 4.4 `src/next`의 처리
- 컬링 모듈은 검증 후 `rendering/culling`으로 편입한다.
- TaskGraph, RenderGraph는 실험 서브패스 `./next`에 유지한다. 본체 편입은 이 PRD 범위 밖이다.

## 5. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 19-a | 렌더 통계와 FPS 측정 도구 (기준선 확보) | 데모에서 백엔드별 수치 기록 |
| 19-b | `createRenderer`와 project-settings 연결, 메인 World `'auto'` 옵트인 | 두 백엔드에서 데모 실행 |
| 19-c | grass, water, flag TSL 포팅 (기존 노드 빌더 테스트 확장) | WGSL/GLSL 생성 테스트, 픽셀 비교 |
| 19-d | fire, sakura, billboard, snowfield, sand, GpuSnow TSL 포팅 | 동일 |
| 19-e | 노드 후처리 파이프라인 | 후처리 on/off 픽셀 비교 |
| 19-f | toon/cozy 프리셋 | 예제 페이지 |
| 19-g | GPU 컬링 확장 | draw call 감소 기록 |
| 19-h | 기본값을 `'auto'`로 전환, postprocessing peer optional화 (사용자 확인) | 2.0 릴리스 노트 |

## 6. 공개 API 영향

- 추가: `createRenderer`, 렌더 프리셋, 렌더 통계 훅.
- peer 변경: `@react-three/postprocessing` optional, three 최소 버전 상향 가능(TSL 기능 요구). 사용자 확인 필요.
- `./postprocessing` 서브패스의 역할 재정의.

## 7. 검증과 완료 기준

- rendering, building, weather 테스트, WGSL/GLSL 생성 테스트
- 브라우저: Chrome(WebGPU), Safari 26(WebGPU), WebGPU 비활성 Chrome(WebGL2 폴백)에서 데모 실행과 스크린샷 비교
- `test:demo` 번들 크기
- HARNESS 기록에서 반복된 "native GPU/FPS 검증 미완료"를 이 PRD에서 해소

## 8. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| three 버전별 TSL API 변화 | peer 범위를 TSL 안정 버전 이상으로 좁힘, 버전 매트릭스 테스트 |
| WebGPU 드라이버별 버그 | `'auto'` 선택 실패 시 WebGL2 폴백 경로 자동 전환, 사용자 설정으로 강제 가능 |
| 픽셀 비교 불안정 | 결정적 시드, 고정 시간, 허용 오차 |

## 9. 열린 질문

1. three peer 범위 하한(현재 `^0.168 || ^0.178 || ^0.185`)을 올릴 것인가.
2. `@react-three/postprocessing` 지원을 2.0에서 유지할지.
