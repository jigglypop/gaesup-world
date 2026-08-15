# WebGPU-First 전환 로드맵 v2

작성일: 2026-08-15. 원칙: **경쟁력이 목표이고, 재작성 회피는 목표가 아니다.** 엔진 코어는 새로 짓는다. 다만 빅뱅 재작성이 아니라 투트랙(strangler-fig)으로: 신규 코어를 그린필드로 개발하고, 기존 12만 줄 중 경쟁력 있는 도메인 자산을 그 위로 이식한다.

## 1. 경쟁력 정의 — 무엇으로 이기는가

2026 지형에서 gaesup-world의 위치:

| 경쟁자 | 강점 | 공백 (gaesup 기회) |
|---|---|---|
| Babylon Lite | WebGPU-native, data-oriented, tree-shakable | 순수 렌더링 엔진. 월드/게임플레이 계층 없음. React 통합 없음 |
| Three.js + R3F 생태계 | 생태계 규모, TSL/WebGPURenderer | "유틸 모음"의 한계. 통합된 월드 런타임 없음. drei는 조각 모음 |
| PlayCanvas | GPU-driven splat, 에디터, 스트리밍 | 클로즈드 에디터 중심, React 코드-퍼스트 워크플로 아님 |
| Bevy(wasm) | 진짜 ECS, data-oriented | 웹은 2급 시민, JS/React 상호운용 빈약 |

**gaesup-world의 승부처는 엔진 프리미티브가 아니라 그 위 계층이다:**

1. **월드/생활형 런타임** — inventory/quests/npc/economy/time/weather/town + 플러그인·세이브 시스템. 어떤 경쟁자도 웹에서 이 계층을 통합 제공하지 않는다.
2. **아바타 파츠 시스템** — 스켈레톤 계약 + OutfitSlot + 런타임 틴트. UGC/커스터마이징 수요 직결.
3. **코드-퍼스트 + React-네이티브** — PlayCanvas류 에디터 락인 없이 npm install로 시작하는 월드 제작.
4. **멀티플레이어 내장** — networks 도메인 + 서버 계약 subpath.

단, 이 상위 계층은 **엔진 프리미티브가 세대 기준(WebGPU, GPU-driven, 스트리밍)을 충족할 때만 팔린다.** 지금의 WebGL/CPU-driven 기반 위에서는 상위 계층이 아무리 좋아도 "구세대 위의 좋은 기능"이다. 따라서 엔진 코어는 타협 없이 새로 만든다.

## 2. 투트랙 구조

```
Track A: gaesup-world/next  (신규 코어, 그린필드)
  WebGPU-first data-oriented runtime
  레거시 호환 부채 없음. 처음부터 표준을 잡는다.

Track B: gaesup-world v1  (기존)
  다이어트 + 유지보수 모드. 신기능 동결.
  도메인 자산을 Track A로 이식하는 공급원.
```

새 코어는 별도 subpath(`gaesup-world/next`, 안정화 후 v2 루트로 승격)로 개발한다. 같은 저장소, 같은 examples에서 검증하되 v1 코드에 의존하지 않는다. 이식은 도메인 단위로: 각 도메인을 새 코어 API로 포팅할 때 다이어트 감사에서 확인한 죽은 부분(미사용 API 354개, 죽은 커널, 제2 블루프린트 시스템)은 **이식하지 않는 것으로 자연 소멸**시킨다.

## 3. Track A — 신규 코어 설계 기준 (그린필드, 타협 없음)

### A-0. 아키텍처 골격

```
gaesup-world/next
        World (data-oriented store: SoA/TypedArray)
              │
         Task Graph (CPU / WASM / GPU 태스크 통합 스케줄)
              │
  ┌───────────┼───────────┬────────────┐
RenderGraph  Physics    Behavior    Streaming
  (WebGPU)  (Rapier      Graph VM   (cell/LOD/
             SIMD→GPU)  (KHR_       priority)
                        interactivity)
              │
        GeometrySource (Mesh | Splat | Procedural | Voxel)
              │
Adapters: React / R3F-interop / Vanilla / (WebXR watch)
```

- **WebGPU가 기준 모델.** WGSL/compute/storage buffer를 1급으로 설계하고, WebGL은 축소 폴백(TSL 이중 타깃)으로만 제공. Babylon Lite와 같은 노선.
- **data-oriented 코어.** v1의 "클래스 + zustand 스냅샷" 대신 TypedArray 기반 컴포넌트 저장. React에는 스냅샷 뷰만 노출(v1 브리지 개념은 계승하되 구현은 새로).
- **렌더러 전략 — 2단계.** 1단계: Three WebGPURenderer + TSL을 백엔드로 사용해 시장 진입 속도 확보. 단, 코어의 렌더 인터페이스는 RenderGraph/GpuTask 계약으로 정의하고 Three를 그 뒤에 숨긴다. 2단계: 계약이 검증되면 핫패스(인스턴싱, 컬링, 파티클, 스키닝)부터 자체 WGSL 파이프라인으로 교체 가능. **"Three 위에 짓는다"가 아니라 "Three를 갈아끼울 수 있게 짓는다."**
- **React는 어댑터.** 코어는 DOM/React 무의존 → OffscreenCanvas 워커 실행이 기본 지원 목표.

### A-1. P0 서브시스템 (에세이 P0와 일치)

| 서브시스템 | 신규/이식 | 비고 |
|---|---|---|
| RenderGraph | **신규** | pass 선언 + 리소스 lifetime + 의존성 컴파일. WebGPU 리소스 관리 포함 |
| GPU Task System | 신규 + v1 이식 | v1 building GPU 컬링 드라이버 8종의 버퍼 계약을 일반화한 설계로 신규 작성 |
| Compute 기반 culling/sort/particles/skinning | 신규 | TSL compute 또는 직접 WGSL |
| Streaming/LOD | 신규 + v1 grid/placement/scene-object 개념 이식 | camera→visibility→LOD→priority→upload 단일 파이프라인 |
| glTF scene pipeline | 신규 | glTF 2.1 씬 단위, meshopt/KTX2, KHR_collision_shapes |
| Behavior Graph VM | v1 GameplayEventEngine 이식 + KHR_interactivity 어댑터 | v1 자산 중 가장 값진 것 중 하나 |
| Task Graph 스케줄러 | 신규 | v1 useBaseFrame의 priority/throttle 개념만 계승 |

### A-2. P1

GPU 파티클 확장, clustered/Forward+ 라이팅, Gaussian Splat GeometrySource, 애니메이션 리타게팅(Canonical Skeleton + Retarget Map — v1 `resolveSharedSkeletonBinding` 리맵 로직 이식), 워커 렌더링 기본화, floating origin(`originCell`은 A-0 데이터 모델에 처음부터 포함).

### A-3. 연구 트랙 (추상화만, 구현 보류)

GPU physics(wgrapier), meshlet/cluster 렌더러, WebXR-WebGPU.

## 4. Track B — v1 처분 계획

- **M0 다이어트는 그대로 선행** (감사 보고서 티어 1-2 + 버그 4종). 이유가 바뀐다: v1을 살리기 위해서가 아니라, (a) 이식 대상을 선별하는 지도를 만들고, (b) 이식 기간(1년+) 동안 v1 사용자를 지탱할 최소 건전성 확보.
- v1 신기능 동결. 수정은 버그와 이식 준비(도메인 결합도 축소)만.
- boilerplate 커널 미사용 절반, blueprints 제2 시스템, SaveLoadManager 체인: **이식 대상에서 제외 = 삭제 확정.** v1에서도 M0에서 제거.
- editor(15,309줄)는 v1 최대 자산이자 최대 부채. 이식 후순위로 미루고, next의 에디터는 새 코어 위에서 필요 최소부터 재구성.

## 5. 도메인 이식 우선순위 (경쟁력 순)

| 순위 | 도메인 | 근거 |
|---|---|---|
| 1 | motions + camera (컨트롤러 계층) | 라이브러리의 원점 기능. next의 첫 데모 = "WebGPU 월드에서 캐릭터 조작" |
| 2 | character 파츠/스켈레톤 계약 | 차별화 1순위. 계약을 next에서 명세(v1 리그를 계약 v1으로) |
| 3 | gameplay(Behavior VM) + save/plugins | 월드 런타임의 심장. KHR_interactivity 접점 |
| 4 | 생활형 도메인군 (inventory/quests/npc/time/weather/economy/town...) | store 계약(serialize/hydrate)이 이미 균일해서 이식 비용 낮음 |
| 5 | networks | 서버 계약 유지한 채 코어만 교체 |
| 6 | building + editor | 규모 최대. next의 스트리밍/GPU 파이프라인 안정 후 |

## 6. 마일스톤

| 마일스톤 | 내용 | 성공 기준 (examples에서 검증) |
|---|---|---|
| **N0** | Track B M0 다이어트 + v2 분기 + `next` 패키지 스캐폴드 | verify:full 통과, next 서브패스 빌드 |
| **N1** | 코어 골격: World(SoA) + Task Graph + RenderGraph 최소형 + WebGPU 컨텍스트 (Three 백엔드) | 회전 큐브가 아니라 **GPU 컬링되는 1만 인스턴스 씬** |
| **N2** | motions/camera 이식 + Rapier SIMD + 입력 | WebGPU 월드에서 캐릭터 3인칭 조작 데모 (v1 데모와 나란히 비교) |
| **N3** | 캐릭터 파이프라인: 스켈레톤 계약 명세 + 파츠/의상 + compute skinning | NPC 군중 500+ compute skinning + 의상 교체 데모 |
| **N4** | 스트리밍 월드: 셀/LOD/priority + glTF 씬 파이프라인 + Behavior VM 이식 | 셀 스트리밍 대형 월드 + KHR_interactivity 에셋 구동 |
| **N5** | 생활형 도메인군 + save + networks 이식, 워커 렌더링 | v1 showcase 데모의 next 재현. **여기서 next → v2 루트 승격** |
| **N6** | Three 핫패스 자체 WGSL 교체 판정, Splat, 리타게팅, clustered 라이팅 | 벤치마크 공개 (PlayCanvas식 수치 비교) |

각 마일스톤 게이트: AGENTS.md 원칙 유지 — examples에서 도달 가능해야 완료. 성능 게이트: frame-perf-auditor 기준 프레임 경로 할당 0, N1부터 perf 오버레이 상시.

## 7. 결정 필요 사항

1. **next 개발 위치**: 같은 repo subpath(권장 — examples/가드 테스트 재사용) vs 별도 repo.
2. **N1 렌더 백엔드**: Three WebGPURenderer 경유(권장 — N1~N5 속도) vs 처음부터 순수 WGSL(N6 앞당김, 기간 2배).
3. **v1 지원 기간**: N5(v2 승격) 후 v1 유지보수 종료 시점.
4. **grid/placement/scene-object**: M0 삭제 목록에서 제외하고 N4 설계 참고용으로 동결 보존할지.

## 8. 리스크

- **투트랙 기간의 이중 유지보수** — v1 동결로 최소화. next가 N2(캐릭터 조작)를 빨리 보여줘야 동력이 유지된다.
- **그린필드의 세컨드 시스템 신드롬** — 각 마일스톤이 "돌아가는 데모" 게이트를 갖는 이유. 추상화는 소비자 2개 이상 생길 때만 일반화.
- WebGPU 미지원 환경 — TSL 이중 타깃 폴백은 N1부터 유지, 단 폴백 품질은 축소 허용(폴백이 발목 잡으면 경쟁력 목표와 모순).
- jsdom은 GPU 검증 불가 — Playwright 계층이 next 테스트의 1급 시민. N1에서 스모크 인프라부터.
- OneDrive I/O — next 개발 시작 전 저장소 이전 권장.
