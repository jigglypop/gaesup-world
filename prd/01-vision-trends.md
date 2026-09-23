# PRD-01 비전과 2026 기술 동향

| 항목 | 값 |
|---|---|
| 성격 | 방향 문서 (구현 slice 없음) |
| 기준 시점 | 2026-09 |

## 1. 포지셔닝

### 1.1 무엇을 만드는가

- **웹 네이티브 월드 엔진**: 브라우저에서 편집하고, 브라우저에서 플레이하고, 정적 호스팅으로 배포한다.
- **수직 특화**: 생활형(cozy life), 월드 빌딩, NPC가 있는 소셜 공간. 이미 building, NPC, 생활형 도메인이 있어 범용 엔진(three.js, Babylon.js, PlayCanvas)과 정면 경쟁하지 않는다.
- **React 개발자용 엔진**: R3F 생태계 위에서 동작한다. 사용자는 컴포넌트와 스크립트로 확장한다.

### 1.2 무엇을 만들지 않는가

- 범용 AAA 렌더러, 콘솔·모바일 네이티브 빌드
- 제품 비즈니스 도메인(미니홈, 친구, 피드, 결제 백엔드). `SPATIAL_RUNTIME_FOUNDATIONS` plan의 경계를 따른다.
- 자체 물리 엔진, 자체 셰이더 언어

## 2. Unity 대비 격차

| Unity 요소 | 역할 | 현재 | 격차 | PRD |
|---|---|---|---|---|
| GameObject / Component | 모든 월드 요소의 공통 모델 | `scene-object`에 모델과 command가 있음 | building, WorldObject가 별도 모델. 에디터가 building을 모름 | 10 |
| MonoBehaviour | 사용자 동작 스크립트 | `gaesup.script` 컴포넌트 타입만 정의됨 | 수명주기, 등록소, 실행기 없음 | 12 |
| Player Loop | 프레임 단계와 순서 | raw `useFrame`, 마운트 순서 의존 | 단계 선언 없음 | 11 |
| Prefab | 재사용 템플릿 | 문서 모델, 인스턴스화 | override, 중첩, variant 없음 | 18 |
| Physics Settings | 레이어, 충돌 매트릭스 | `project-settings`에 `collisionMatrix` 스키마 | Rapier 충돌 그룹 연결 없음 | 14 |
| Animator | 상태 머신, blend tree | 결정 경로 2개 | 상태 머신 없음 | 16 |
| Input System | 액션 맵, 디바이스 추상화 | `project-settings`에 `bindings` 스키마, 키보드 소유권 | 액션 맵 런타임, 게임패드·터치 없음 | 17 |
| Asset Database | import, 메타, 의존성 | 카탈로그와 로드 | import 파이프라인 없음 | 20 |
| Scene Management | 로드, additive, 스트리밍 | 없음 | 씬 전환 API 없음 | 10, 25 |
| Build Settings | 배포 빌드 | `project-settings`에 `build` 스키마 | 실행기 없음 | 25 |
| Profiler | 성능 계측 | `perf` 도메인 일부 | 패널 부족 | 26 |
| Undo | 모든 편집 되돌리기 | scene-object만 | building 없음 | 18 |

## 3. 2026-09 기준 기술 동향과 채택 결정

### 3.1 WebGPU

- **사실**: Chrome, Edge, Safari 26(macOS, iOS, visionOS 기본 활성), Firefox(Windows 141+, Apple Silicon macOS 145+)에서 사용 가능. Firefox Linux와 Android는 2026년 중 진행.
- **사실**: three.js `WebGPURenderer`는 WebGL2로 자동 폴백한다. 셰이더와 후처리는 TSL(노드) 방식이 표준 경로다.
- **결정**: 메인 World를 `WebGPURenderer`로 전환하고 WebGL2 폴백을 유지한다. 새 셰이더는 TSL로만 작성한다. `project-settings.rendering.backend`의 `'auto' | 'webgl' | 'webgpu'`를 실제 렌더러 선택에 연결한다. (PRD-19)

### 3.2 R3F v10

- **사실**: 2026-09 현재 alpha. WebGPU·TSL 1급 지원, `useFrame`의 새 스케줄러(단계와 순서 지정, Canvas 밖 사용), 멀티 캔버스.
- **결정**: 지금 채택하지 않는다. 대신 PRD-11에서 엔진 자체 프레임 단계 API를 만들고, 내부 구현을 v10 스케줄러로 교체할 수 있는 모양으로 설계한다. v10 정식 출시 후 peer 범위에 추가한다.

### 3.3 GPU 중심 렌더링

- **사실**: compute 컬링, indirect draw, 대량 인스턴싱이 웹에서도 실용 단계다.
- **현재**: `BuildingGpuCullingDriver`, `src/next`(TaskGraph, RenderGraph, culling)가 있다.
- **결정**: `src/next`는 계속 실험 서브패스로 두되, 검증된 조각(컬링)부터 본체 렌더 경로로 편입한다. (PRD-19)

### 3.4 가우시안 스플래팅

- **사실**: three.js r186에 네이티브 스플랫 렌더러(WebGPU/TSL, SH0, LoD 없음) 병합. Spark 2.0은 LoD와 스트리밍 제공. PlayCanvas는 스플랫 기반 게임 제작을 지원.
- **결정**: P3. 에셋 타입에 `splat`을 예약하고, three 네이티브 렌더러가 peer 범위에 들어온 뒤 `MeshRenderer`와 같은 층위의 `SplatRenderer` 컴포넌트로 추가한다. (PRD-20)

### 3.5 물리

- **사실**: Rapier는 웹 성능이 크게 개선됐고 CCD와 제약조건이 강하다. Jolt(WASM)는 차량, 소프트바디, 천을 지원하고 대형 씬에서 빠르다는 벤치마크가 있다.
- **결정**: Rapier 유지. 단 `PhysicsSystem`의 Rapier 직접 결합을 어댑터 뒤로 옮겨 교체 가능성을 확보한다. Jolt 도입은 차량·소프트바디 요구가 생길 때 결정한다. (PRD-14)

### 3.6 멀티플레이 전송

- **사실**: WebTransport가 Safari 26.4(2026-03)로 주요 브라우저 전체 지원. datagram으로 패킷 손실 시 지연이 크게 줄어든다. 서버 프레임워크와 호스팅은 아직 WebSocket 중심.
- **결정**: 기본 전송은 WebSocket. `NetworkAdapter` 계약 뒤에 WebSocket 구현을 두고 WebTransport 구현을 두 번째로 추가한다. (PRD-22)

### 3.7 AI 제작 도구

- **사실**: text/image-to-3D(Meshy, Tripo, Ludo)가 GLB, PBR, 자동 리깅을 출력한다. 리토폴로지와 UV 정리는 여전히 필요. AI 네이티브 브라우저 엔진이 등장.
- **결정**:
  - 씬, 프리팹, 프로젝트 설정을 스키마가 있는 JSON으로 유지한다. LLM이 command로 씬을 편집할 수 있는 구조가 이미 `SceneDocumentCommand`에 있다.
  - 에셋 import 파이프라인에 AI 생성 에셋 검증 단계(폴리곤 수, 텍스처 크기, 스켈레톤 호환)를 둔다. (PRD-20)
  - 선택: 에디터 command를 외부 도구(LLM 에이전트)가 호출할 수 있는 자동화 표면. P3.

### 3.8 협업 에디터

- **사실**: PlayCanvas의 클라우드 동시 편집이 웹 엔진 에디터의 차별점으로 자리잡았다.
- **결정**: P3. 전제는 모든 편집이 command로 표현되는 것(PRD-10, PRD-18). 그 위에 CRDT나 서버 순서화를 얹는다.

## 4. 성공 지표 (2.0)

| 지표 | 목표 |
|---|---|
| 월드 원본 모델 수 | 1 (SceneDocument) |
| 편집 가능한 월드 요소 중 undo 가능 비율 | 100% |
| raw `useFrame` 사용 | 0 |
| 스크립트 컴포넌트로 만든 예제 동작 | 5개 이상 (문 열기, 트리거 존, 회전 오브젝트, NPC 대화 트리거, 수집 아이템) |
| 메인 World 렌더러 | WebGPU 기본, WebGL2 폴백 |
| 에디터에서 만든 씬을 정적 사이트로 배포 | 가능 |
| 프레임당 JS 할당 (정지 상태 캐릭터, 기본 월드) | 측정 후 기준선 대비 50% 이하 |

## 5. 참고 자료

- What's New in Three.js (2026): https://www.utsubo.com/blog/threejs-2026-what-changed
- Three.js WebGPURenderer manual: https://threejs.org/manual/en/webgpurenderer.html
- WebGPU supported in major browsers: https://web.dev/blog/webgpu-supported-major-browsers
- WebGPU Implementation Status: https://github.com/gpuweb/gpuweb/wiki/Implementation-Status
- R3F Releases: https://github.com/pmndrs/react-three-fiber/releases
- Three.js r186 Native Gaussian Splat Renderer: https://radiancefields.com/three.js-merges-a-native-gaussian-splat-renderer-for-webgpu-in-r186
- Web game engines in 2026 comparison: https://app.cinevva.com/blog/2026-06-09-web-game-engines-2026-comparison
- Rapier 2025 review and 2026 goals: https://dimforge.com/blog/2026/01/09/the-year-2025-in-dimforge/
- WebTransport Is Now Baseline: https://webrtc.ventures/2026/04/webtransport-is-now-baseline-what-it-means-for-real-time-media/
- Best AI Tools for 3D Game Assets: https://www.meshy.ai/blog/best-ai-tools-for-3d-game-assets
