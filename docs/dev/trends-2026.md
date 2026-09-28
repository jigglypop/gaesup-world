# 2026년 9월 웹 3D 동향과 대응

2026년 9월 기준 웹 3D 생태계의 변화와 gaesup-world가 그에 맞춰 무엇을 지우고 무엇을 만들지 정리한다. 원칙("upstream 우선", "WebGPU 전면")의 근거가 되는 문서다. 조사일은 2026-09-27이고 출처는 맨 아래에 있다.

## 한눈에

| 동향 | gw 대응 | PRD |
|---|---|---|
| WebGPU가 모든 주요 브라우저 기본 | `WebGPURenderer`+TSL만 남긴다 | GPU-1 |
| three r186 `SunLight`(두 백엔드 CSM), r185 클러스터 조명, r184 업스케일·`LightProbeGrid` | 자체 해·라이트 풀 삭제, 품질 tier에 업스케일 | UP-1 |
| R3F 10 alpha: WebGPU 1급, 새 스케줄러, `useRenderPipeline` | 자체 스케줄러·렌더러 팩토리를 얇게 유지하고 안정판 뒤 전환 | (후속) |
| GPU compute 일반화 | GPU 컬링을 일반 소품으로, 동적 GI | PERF, GI-1 |
| Gaussian splat 표준화 | 선택 플러그인 후보 | (후보) |
| WebTransport 약 91% | 멀티플레이 transport 추상화 | (후보) |
| AI 제작(text/image→3D, vibe coding, `llms.txt`) | 자산 파이프라인 유지, 공개 API 축소, 기계가 읽기 쉬운 문서 | LIB-1 |
| 브라우저 협업 에디터·UGC | 에디터 + 멀티플레이 동시 편집을 차별점으로 | EX-1 이후 |

## 1. WebGPU

- Chrome/Edge(Windows·macOS·ChromeOS), Android Chrome(Android 12 이상, 최근 기기), Safari 26(macOS·iOS·iPadOS·visionOS), Firefox 141(Windows)·145(Apple Silicon macOS)에서 기본으로 켜져 있다. Firefox Android는 2026년 말 목표다.
- `WebGPURenderer`는 WebGPU가 없으면 WebGL2로 자동 fallback하고 같은 TSL 재질을 GLSL로 컴파일한다. 코드 한 벌로 두 백엔드를 덮는다.
- 표준 WebGPU에는 **하드웨어 레이트레이싱이 없다**. wgpu에 실험 확장이 있을 뿐 표준 작업 그룹은 약속하지 않았다. 바인드리스 리소스도 2026년 이후다. 큐도 하나라 async compute가 없다.

## 2. three.js (2025-12 ~ 2026-09)

| 릴리스 | 날짜 | gw에 중요한 변경 |
|---|---|---|
| r182 | 2025-12-10 | 그림자 매핑 현대화, 표준·물리 재질 정확도 개선 |
| r183 | 2026-02-18 | `PostProcessing` → `RenderPipeline` 이름 변경, `Clock` deprecated → `Timer` |
| r184 | 2026-04-16 | WebGPU `compileAsync()` 비차단, FSR 1·TAAU 업스케일 노드, `LightProbeGrid` GI 애드온, `BatchedMesh` 옛 multi-draw 경로 삭제, WebGL용 NodeMaterial 호환 층 |
| r185 | 2026-06-25 | 클러스터(Forward+) 조명, WebGPU로 WebXR, TSL 컴파일 약 3배 빨라짐, 텍스처 배열 렌더링, 스킨 위치가 `positionLocal`에서 빠짐(`positionGeometry`) |
| r186 | 2026-09-08 | `SunLight` 애드온(두 백엔드 cascade 그림자), `compileComputeAsync()`, PBR 에너지 보존 재작업, `PCFSoftShadowMap` 삭제, 최소화 빌드 삭제 |

- 저장소는 three 0.186을 쓴다. R3F의 `<Canvas shadows>` 기본값이 `PCFSoftShadowMap`이라 WebGPU에서 경고가 나므로 `shadows="percentage"`를 쓴다.
- SSGI(`SSGINode`), SSS, 개선된 DoF 같은 새 효과는 WebGPU 렌더러 전용이다.

## 3. React Three Fiber

- 안정판은 9.8.0(2026-09-22)이고, 10은 alpha다.
- 10의 변화: WebGPU·TSL 1급 지원, `useFrame`을 단계가 있는 새 스케줄러로(캔버스 밖에서도 사용), 다중 캔버스 기본 지원, drei의 필수 기능 일부가 코어로, TSL용 `useUniforms`·`useNodes`·`useLocalNodes`, compute용 `useBuffers`·`useGPUStorage`, `useRenderPipeline`.
- gw의 `FrameScheduler`(단계 스케줄러), `createRenderer`(비동기 WebGPU 캔버스), `WorldPostProcessing`이 10과 겹친다. 10 안정판이 나오면 이쪽으로 옮기고 자체 구현을 지운다. 그 전까지는 이 세 부분에 기능을 더 쌓지 않는다.

## 4. GPU compute와 GPU 주도 렌더링

- compute로 파티클, 충돌, 컬링, 절차 생성, 대량 인스턴싱을 돌리는 것이 일반화됐다. 100만 단위 파티클 사례가 흔하다.
- gw의 `GpuBatchBridge`는 `building-batch:` 인스턴스만 compute 컬링한다. 일반 소품과 NPC로 넓힐 여지가 있다(PERF).

## 5. Gaussian splat

- glTF 확장 `KHR_gaussian_splatting`이 표준이 되어 가고 있다.
- three용 Spark(World Labs) 2.0(2026-04)은 LoD 스트리밍으로 큰 splat 월드를 그린다. PlayCanvas는 SuperSplat 편집기·뷰어, Babylon.js 9.0(2026-03)은 splat 그림자와 compute 볼류메트릭 조명을 넣었다.
- gw에는 "촬영한 장소를 배경으로" 쓰는 선택 플러그인으로 맞다. 코어에는 넣지 않는다.

## 6. 네트워킹

- Safari 26.4(2026-03)가 WebTransport를 지원해 전 세계 사용량 기준 약 91%다. 서버 프레임워크는 아직 WebSocket 중심이다.
- 음성·영상 같은 실시간 미디어는 여전히 WebRTC가 맡는다.
- gw 대응: `PlayerNetworkManager`에서 transport를 떼어 WebSocket과 WebTransport를 고르게 한다. 멀티플레이 서버(릴레이)는 저장소에 아직 없다.

## 7. AI 제작

- text/image→3D 도구(Meshy 등)가 PBR 텍스처와 자동 리깅까지 한 번에 만든다. 대부분 리토폴로지·UV 정리가 필요하다.
- AI가 게임 로직을 쓰는 "vibe coding"이 퍼졌다. three.js는 AI 도구용 `llms.txt` 문서를 낸다. 오래된 코드로 학습한 모델은 deprecated API(`Clock`, `PostProcessing`)를 제안하는 문제가 있다.
- gw 대응: `scripts/assets`의 Meshy·Blender·meshopt 파이프라인을 유지한다. 공개 API를 줄이면(루트 export 952개) AI와 사람 모두 쓰기 쉬워진다. `docs/`를 기계가 읽기 쉬운 형태로 유지한다.

## 8. 에디터·UGC·XR

- PlayCanvas는 여러 사람이 같은 장면을 동시에 편집하는 클라우드 에디터로 차별화한다. Nilo 같은 브라우저 UGC 도구는 설명만으로 3D 세계를 만든다.
- gw의 차별점 후보는 "멀티플레이로 같이 꾸미는 월드 + NPC 시뮬레이션"이다. 에디터와 네트워크가 이미 있다.
- WebXR은 WebGPU와 함께 쓸 수 있게 됐고(r185), 패스스루 AR이 가장 빠르게 성장한다. gw는 후순위다.

## 9. 동적 GI: 언리얼 Lumen을 웹에서?

**결론: Lumen을 wasm으로 돌리는 것은 실시간으로 불가능하다. Lumen과 비슷한 동적 GI는 WebGPU compute로 가능하다.**

- Lumen은 화면 공간 프로브, 메시 SDF와 전역 SDF 트레이싱, surface cache(카드), radiance cache, 시간 누적 디노이즈로 이뤄진 GPU compute 파이프라인이다. 콘솔 GPU에서 프레임당 수 ms를 쓴다.
- wasm은 CPU에서 돈다(128비트 SIMD, 스레드). 이 계산을 CPU로 하면 수백~수천 배 느리다. wasm의 자리는 **전처리**다: 메시 SDF 생성, 복셀화, BVH, 프로브 배치, 정적 GI 굽기(워커).
- 표준 WebGPU에 하드웨어 레이트레이싱이 없으므로 Lumen의 **소프트웨어 트레이싱 경로**(SDF·복셀)에 해당하는 방식만 가능하다. 단일 큐, 모바일 메모리·대역폭 제약 때문에 낮은 해상도와 시간 분할이 필수다.

**gw 설계(Lumen-lite, PRD GI-1)**

1. upstream 기반: three `SSGINode`(화면 공간 GI) + r184 `LightProbeGrid`(프로브) + r186 `SunLight`(직접광).
2. gw 고유: 월드가 이미 4m 격자(타일·벽·블록)라 **복셀화가 거의 공짜**다. 건축 데이터에서 GPU 3D 텍스처(불투명도·알베도·발광)를 직접 채우고 편집한 셀만 갱신한다. compute가 프로브에서 복셀을 레이마칭(DDGI 방식)하고 프레임마다 일부 프로브만 갱신한다. 카메라 근처는 SSGI로 보강한다.
3. wasm: 정적 부분의 GI 굽기, GLB 소품의 SDF 생성(워커). 기존 Rust wasm 코어(잔디·A*)에 붙인다.
4. 품질 tier: low는 구운 프로브, medium은 동적 프로브, high는 프로브+SSGI. 내장 GPU에서 GI에 쓰는 GPU 시간 4ms 이하를 목표로 한다.
5. 선행 조건: GPU-1(WebGPU 전면), UP-1(해 통합), PERF(GPU 시간 측정). 화면 공간 부분(SSGI·SSR)은 `WorldPostProcessing`의 `cinematic` preset으로 들어갔다. r186에는 VXGI 애드온(`lighting/vxgi`, 복셀 콘 트레이싱)도 있어 2의 자체 복셀 GI보다 먼저 검토한다.

## 출처

- [What's New in Three.js (2026)](https://www.utsubo.com/blog/threejs-2026-what-changed) · [three.js releases](https://github.com/mrdoob/three.js/releases) · [Migrate Three.js to WebGPU (2026)](https://www.utsubo.com/blog/webgpu-threejs-migration-guide)
- [R3F v10 alpha 논의](https://github.com/pmndrs/react-three-fiber/discussions/3665) · [R3F releases](https://github.com/pmndrs/react-three-fiber/releases)
- [WebGPU Implementation Status](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status) · [WebGPU supported in major browsers (web.dev)](https://web.dev/blog/webgpu-supported-major-browsers) · [WebGPU roadmap 2025–2027](https://kaelan.fyi/research/webgpu-future-roadmap/) · [wgpu ray tracing (experimental)](https://github.com/gfx-rs/wgpu/blob/trunk/docs/api-specs/ray_tracing.md)
- [three.js SSGINode](https://threejs.org/docs/pages/SSGINode.html) · [SSGI 예제](https://threejs.org/examples/webgpu_postprocessing_ssgi.html)
- [Gaussian Splatting 2026 가이드](https://www.utsubo.com/blog/gaussian-splatting-guide) · [Spark 2.0](https://www.worldlabs.ai/blog/spark-2.0) · [State of Gaussian Splatting 2026](https://www.thefuture3d.com/blog/state-of-gaussian-splatting-2026/)
- [WebRTC predictions 2026](https://bloggeek.me/webrtc-predictions-2026/) · [Multiplayer browser game 2026](https://app.cinevva.com/guides/multiplayer-browser-game)
- [Web game engines 2026](https://app.cinevva.com/blog/2026-06-09-web-game-engines-2026-comparison) · [Best browser game engines 2026 (Nilo)](https://nilo.io/articles/best-browser-game-engines-2026) · [AI game asset tools 2026 (Meshy)](https://www.meshy.ai/blog/best-ai-tools-for-3d-game-assets)

## 관련 문서

- [principles.md](principles.md) · [decisions.md](decisions.md) · [module-status.md](module-status.md) · [../guide/rendering.md](../guide/rendering.md)
- [../../PRD.md](../../PRD.md)
